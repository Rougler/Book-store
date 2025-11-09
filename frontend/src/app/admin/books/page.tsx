"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { InputField } from "@/components/ui/input-field";
import { SectionHeading } from "@/components/ui/section-heading";
import { SelectField } from "@/components/ui/select-field";
import { StatusModal } from "@/components/ui/status-modal";
import { TextareaField } from "@/components/ui/textarea-field";
import type { FieldError } from "react-hook-form";
import { useAdminAuth } from "@/context/auth-context";
import { apiRequest, uploadFile } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/env";
import { Book } from "@/lib/types";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author is required."),
  price: z.coerce.number().min(0, "Price must be positive."),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  image_url: z
    .string()
    .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  content_url: z
    .string()
    .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  is_featured: z.boolean().default(false),
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function AdminBooksPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAdminAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [useImageUpload, setUseImageUpload] = useState(false);
  const [useContentUpload, setUseContentUpload] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingContent, setUploadingContent] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    bookId: number | null;
    bookTitle: string;
  }>({
    isOpen: false,
    bookId: null,
    bookTitle: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      price: 0,
      category: "",
      description: "",
      image_url: "",
      content_url: "",
      is_featured: false,
    },
  });

  useEffect(() => {
    // Only redirect after client-side initialization
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.push("/admin");
      return;
    }

    if (isAuthenticated) {
      loadBooks();
    }
  }, [isAuthenticated, router]);

  // Ensure file input refs are available when upload mode is enabled
  useEffect(() => {
    if (useImageUpload && imageInputRef.current) {
      // Ref is ready
    }
  }, [useImageUpload]);

  useEffect(() => {
    if (useContentUpload && contentInputRef.current) {
      // Ref is ready
    }
  }, [useContentUpload]);

  const loadBooks = async () => {
    try {
      const booksData = await apiRequest<Book[]>("/api/admin/books", { requireAuth: true, role: "admin" });
      setBooks(booksData);
    } catch {
      // Silently handle errors - books list will be empty
      // Error is logged on server side
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: BookFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = values.image_url || null;
      let contentUrl = values.content_url || null;

      // Upload image file if provided
      if (useImageUpload && imageFile) {
        setUploadingImage(true);
        try {
          const result = await uploadFile("/api/uploads/image", imageFile, {
            requireAuth: true,
            role: "admin",
          });
          imageUrl = `${getApiBaseUrl()}${result.url}`;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to upload image.";
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Upload Failed",
            message,
          });
          setIsSubmitting(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Upload content file if provided
      if (useContentUpload && contentFile) {
        setUploadingContent(true);
        try {
          const result = await uploadFile("/api/uploads/pdf", contentFile, {
            requireAuth: true,
            role: "admin",
          });
          contentUrl = `${getApiBaseUrl()}${result.url}`;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to upload PDF.";
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Upload Failed",
            message,
          });
          setIsSubmitting(false);
          return;
        } finally {
          setUploadingContent(false);
        }
      }

      await apiRequest<Book>("/api/admin/books", {
        method: "POST",
        body: {
          title: values.title,
          author: values.author,
          price: values.price,
          description: values.description || null,
          category: values.category,
          image_url: imageUrl,
          content_url: contentUrl,
          is_featured: values.is_featured,
        },
        requireAuth: true,
        role: "admin",
      });
      reset();
      setImageFile(null);
      setContentFile(null);
      setUseImageUpload(false);
      setUseContentUpload(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (contentInputRef.current) contentInputRef.current.value = "";
      setShowAddForm(false);
      await loadBooks();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Book added successfully!",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add book.";
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (bookId: number, bookTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      bookId,
      bookTitle,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.bookId) return;

    try {
      await apiRequest(`/api/admin/books/${deleteConfirmation.bookId}`, {
        method: "DELETE",
        requireAuth: true,
        role: "admin",
      });
      await loadBooks();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Book deleted successfully!",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete book.";
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message,
      });
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        bookId: null,
        bookTitle: "",
      });
    }
  };

  const handleImageFileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Directly trigger the file input click
    if (imageInputRef.current) {
      imageInputRef.current.click();
    } else {
      // Fallback: find by ID
      const input = document.getElementById("image-file-input") as HTMLInputElement;
      if (input) {
        input.click();
      }
    }
  };

  const handleContentFileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Directly trigger the file input click
    if (contentInputRef.current) {
      contentInputRef.current.click();
    } else {
      // Fallback: find by ID
      const input = document.getElementById("content-file-input") as HTMLInputElement;
      if (input) {
        input.click();
      }
    }
  };

  // Show loading state while checking authentication or loading data
  if (!isAuthenticated || isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SectionHeading title="Books Management" description={!isAuthenticated ? "Redirecting..." : "Loading..."} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <SectionHeading title="Books Management" description="Manage your bookstore inventory" />
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Back to dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            aria-label="Add new book"
          >
            {showAddForm ? "Cancel" : "+ Add New Book"}
          </button>
          <button
            onClick={() => {
              logout();
              router.push("/admin");
            }}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Add New Book</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InputField id="title" label="Title *" register={register} error={errors.title} />
              <InputField id="author" label="Author *" register={register} error={errors.author} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="price"
                label="Price *"
                type="number"
                register={register}
                error={errors.price as FieldError | undefined}
              />
              <SelectField
                id="category"
                label="Category *"
                register={register}
                error={errors.category}
                options={[
                  { value: "Fiction", label: "Fiction" },
                  { value: "Fantasy", label: "Fantasy" },
                  { value: "Science Fiction", label: "Science Fiction" },
                  { value: "Mystery", label: "Mystery" },
                  { value: "Romance", label: "Romance" },
                  { value: "Biography", label: "Biography" },
                  { value: "History", label: "History" },
                  { value: "Non-Fiction", label: "Non-Fiction" },
                  { value: "Business", label: "Business" },
                  { value: "Self-Help", label: "Self-Help" },
                  { value: "Education", label: "Education" },
                ]}
              />
            </div>
            {/* Image URL/Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Book Image</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseImageUpload(false);
                    setImageFile(null);
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    !useImageUpload ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseImageUpload(true);
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    useImageUpload ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Upload
                </button>
              </div>
              {useImageUpload ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        id="image-file-input"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file type
                            const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
                            if (!validTypes.includes(file.type)) {
                              setStatusModal({
                                isOpen: true,
                                type: "error",
                                title: "Invalid File Type",
                                message: "Please select a valid image file (JPEG, PNG, WebP, or GIF)",
                              });
                              if (imageInputRef.current) imageInputRef.current.value = "";
                              return;
                            }
                            setImageFile(file);
                          }
                        }}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={handleImageFileClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        Choose Image File
                      </button>
                    </div>
                    {imageFile && (
                      <span className="text-sm text-slate-600">{imageFile.name}</span>
                    )}
                  </div>
                  {imageFile && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-600">Selected:</span>
                      <span className="text-xs font-medium text-slate-900">{imageFile.name}</span>
                      <span className="text-xs text-slate-500">({(imageFile.size / 1024).toFixed(2)} KB)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          if (imageInputRef.current) imageInputRef.current.value = "";
                        }}
                        className="ml-auto text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {uploadingImage && <p className="text-xs text-blue-600">Uploading image...</p>}
                </div>
              ) : (
                <InputField id="image_url" label="" type="url" register={register} error={errors.image_url} placeholder="https://example.com/image.jpg" />
              )}
            </div>

            {/* Content URL/Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Content (PDF/E-book)</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseContentUpload(false);
                    setContentFile(null);
                    if (contentInputRef.current) contentInputRef.current.value = "";
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    !useContentUpload ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseContentUpload(true);
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    useContentUpload ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Upload
                </button>
              </div>
              {useContentUpload ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <input
                        ref={contentInputRef}
                        type="file"
                        id="content-file-input"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file type
                            if (file.type !== "application/pdf") {
                              setStatusModal({
                                isOpen: true,
                                type: "error",
                                title: "Invalid File Type",
                                message: "Please select a valid PDF file",
                              });
                              if (contentInputRef.current) contentInputRef.current.value = "";
                              return;
                            }
                            setContentFile(file);
                          }
                        }}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={handleContentFileClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        Choose PDF File
                      </button>
                    </div>
                    {contentFile && (
                      <span className="text-sm text-slate-600">{contentFile.name}</span>
                    )}
                  </div>
                  {contentFile && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-600">Selected:</span>
                      <span className="text-xs font-medium text-slate-900">{contentFile.name}</span>
                      <span className="text-xs text-slate-500">({(contentFile.size / 1024).toFixed(2)} KB)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setContentFile(null);
                          if (contentInputRef.current) contentInputRef.current.value = "";
                        }}
                        className="ml-auto text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {uploadingContent && <p className="text-xs text-blue-600">Uploading PDF...</p>}
                </div>
              ) : (
                <InputField id="content_url" label="" type="url" register={register} error={errors.content_url} placeholder="https://example.com/book.pdf" />
              )}
            </div>
            <TextareaField id="description" label="Description" register={register} error={errors.description} rows={4} />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" {...register("is_featured")} className="h-4 w-4 rounded border-slate-300" />
              Featured Book
            </label>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Add book"
              >
                {isSubmitting ? "Adding..." : "Add Book"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  reset();
                  setImageFile(null);
                  setContentFile(null);
                  setUseImageUpload(false);
                  setUseContentUpload(false);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                  if (contentInputRef.current) contentInputRef.current.value = "";
                }}
                className="rounded-full border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {books.length > 0 ? (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-semibold text-slate-900">{book.title}</div>
                      {book.is_featured && <span className="text-xs text-blue-600">⭐ Featured</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{book.author}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{book.category}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">₹{book.price.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${book.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {book.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(book.id, book.title)}
                        className="text-red-600 transition-colors hover:text-red-900"
                        aria-label={`Delete ${book.title}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No books found. Add your first book to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        autoClose={statusModal.type === "success"}
        autoCloseDelay={3000}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            bookId: null,
            bookTitle: "",
          })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Book"
        message={`Are you sure you want to delete "${deleteConfirmation.bookTitle}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
      />
    </div>
  );
}

