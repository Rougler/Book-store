"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import { HomepageContent, HeroSlide, HeroStep, GrowthStep, HubCard, StatItem, WhyChooseItem, Quote, HowItWorksStep, KeyFeature } from "@/lib/types";

export default function ContentManagementPage() {
    const [content, setContent] = useState<HomepageContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeSection, setActiveSection] = useState<string>("hero_slides");

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setIsLoading(true);
            const data = await apiRequest<HomepageContent>("/api/content/homepage");
            setContent(data);
        } catch (err) {
            setError("Failed to load content");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!content) return;

        try {
            setIsSaving(true);
            setError("");
            setSuccess("");

            await apiRequest("/api/content/homepage", {
                method: "PUT",
                body: JSON.stringify({
                    section_key: "homepage",
                    content: content,
                }),
            });

            setSuccess("✅ Content saved successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to save content");
        } finally {
            setIsSaving(false);
        }
    };

    const updateContent = <K extends keyof HomepageContent>(
        key: K,
        value: HomepageContent[K]
    ) => {
        if (content) {
            setContent({ ...content, [key]: value });
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="relative mx-auto h-16 w-16">
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                    </div>
                    <p className="mt-4 text-lg font-medium text-slate-600">Loading content...</p>
                </div>
            </div>
        );
    }

    if (!content) return null;

    const sections = [
        { id: "hero_slides", label: "🎨 Hero Slides", icon: "🎨" },
        { id: "hero_steps", label: "📋 Hero Steps", icon: "📋" },
        { id: "growth_model", label: "📈 Growth Model", icon: "📈" },
        { id: "platform_hubs", label: "🏢 Platform Hubs", icon: "🏢" },
        { id: "stats", label: "📊 Statistics", icon: "📊" },
        { id: "why_choose_us", label: "⭐ Why Choose Us", icon: "⭐" },
        { id: "core_quote", label: "💬 Core Quote", icon: "💬" },
        { id: "how_it_works", label: "⚙️ How It Works", icon: "⚙️" },
        { id: "key_features", label: "🔑 Key Features", icon: "🔑" },
        { id: "success_stories", label: "🎯 Success Stories", icon: "🎯" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Content Sections</h2>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeSection === section.id
                                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                                        : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <span className="mr-2">{section.icon}</span>
                                    {section.label.replace(/^[^\s]+ /, '')}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                            <p className="mt-2 text-slate-600">Edit your homepage content with ease</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 disabled:bg-indigo-400 cursor-pointer"
                        >
                            {isSaving ? "Saving..." : "💾 Save All Changes"}
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                            <div className="flex items-start">
                                <div className="text-2xl mr-3">⚠️</div>
                                <div>
                                    <h3 className="font-semibold text-red-900">Error</h3>
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                            <p className="text-green-700 font-semibold">{success}</p>
                        </div>
                    )}

                    {/* Content Sections */}
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                        {activeSection === "hero_slides" && (
                            <HeroSlidesEditor
                                slides={content.hero_slides}
                                onChange={(slides) => updateContent("hero_slides", slides)}
                            />
                        )}

                        {activeSection === "hero_steps" && (
                            <HeroStepsEditor
                                steps={content.hero_steps}
                                onChange={(steps) => updateContent("hero_steps", steps)}
                            />
                        )}

                        {activeSection === "growth_model" && (
                            <GrowthModelEditor
                                steps={content.growth_model}
                                onChange={(steps) => updateContent("growth_model", steps)}
                            />
                        )}

                        {activeSection === "platform_hubs" && (
                            <PlatformHubsEditor
                                hubs={content.platform_hubs}
                                onChange={(hubs) => updateContent("platform_hubs", hubs)}
                            />
                        )}

                        {activeSection === "stats" && (
                            <StatsEditor
                                stats={content.stats}
                                onChange={(stats) => updateContent("stats", stats)}
                            />
                        )}

                        {activeSection === "why_choose_us" && (
                            <WhyChooseUsEditor
                                items={content.why_choose_us}
                                onChange={(items) => updateContent("why_choose_us", items)}
                            />
                        )}

                        {activeSection === "core_quote" && (
                            <CoreQuoteEditor
                                quote={content.core_quote}
                                onChange={(quote) => updateContent("core_quote", quote)}
                            />
                        )}

                        {activeSection === "how_it_works" && (
                            <HowItWorksEditor
                                steps={content.how_it_works}
                                onChange={(steps) => updateContent("how_it_works", steps)}
                            />
                        )}

                        {activeSection === "key_features" && (
                            <KeyFeaturesEditor
                                features={content.key_features}
                                onChange={(features) => updateContent("key_features", features)}
                            />
                        )}

                        {activeSection === "success_stories" && (
                            <SuccessStoriesEditor
                                title={content.success_stories_title}
                                subtitle={content.success_stories_subtitle}
                                onTitleChange={(title) => updateContent("success_stories_title", title)}
                                onSubtitleChange={(subtitle) => updateContent("success_stories_subtitle", subtitle)}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Hero Slides Editor Component
function HeroSlidesEditor({ slides, onChange }: { slides: HeroSlide[]; onChange: (slides: HeroSlide[]) => void }) {
    const addSlide = () => {
        onChange([...slides, {
            title: "New Slide Title",
            subtitle: "New Subtitle",
            quote: "New quote text",
            author: "Author Name",
            designation: "Designation",
            gradient: "from-indigo-600 via-purple-600 to-pink-600",
            bgGradient: "from-slate-900 via-indigo-900 to-slate-800",
            accentColor: "indigo",
            image: "📚",
            backgroundImage: "",
            altText: "Alt text"
        }]);
    };

    const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
        const updated = [...slides];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeSlide = (index: number) => {
        onChange(slides.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Hero Slides</h2>
                <button
                    onClick={addSlide}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                >
                    + Add Slide
                </button>
            </div>

            <div className="space-y-6">
                {slides.map((slide, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Slide {index + 1}</h3>
                            <button
                                onClick={() => removeSlide(index)}
                                className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                            >
                                🗑️ Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={slide.title}
                                    onChange={(e) => updateSlide(index, "title", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
                                <input
                                    type="text"
                                    value={slide.subtitle}
                                    onChange={(e) => updateSlide(index, "subtitle", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Quote</label>
                                <textarea
                                    value={slide.quote}
                                    onChange={(e) => updateSlide(index, "quote", e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
                                <input
                                    type="text"
                                    value={slide.author}
                                    onChange={(e) => updateSlide(index, "author", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
                                <input
                                    type="text"
                                    value={slide.designation}
                                    onChange={(e) => updateSlide(index, "designation", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={slide.image}
                                    onChange={(e) => updateSlide(index, "image", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Background Image URL</label>
                                <input
                                    type="text"
                                    value={slide.backgroundImage}
                                    onChange={(e) => updateSlide(index, "backgroundImage", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Hero Steps Editor Component
function HeroStepsEditor({ steps, onChange }: { steps: HeroStep[]; onChange: (steps: HeroStep[]) => void }) {
    const updateStep = (index: number, field: keyof HeroStep, value: string | number) => {
        const updated = [...steps];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Hero Steps</h2>
            <div className="grid grid-cols-2 gap-6">
                {steps.map((step, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Step {step.number}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateStep(index, "title", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(index, "description", e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={step.icon}
                                    onChange={(e) => updateStep(index, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Growth Model Editor Component
function GrowthModelEditor({ steps, onChange }: { steps: GrowthStep[]; onChange: (steps: GrowthStep[]) => void }) {
    const updateStep = (index: number, field: keyof GrowthStep, value: string | number) => {
        const updated = [...steps];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Growth Model Steps</h2>
            <div className="grid grid-cols-2 gap-6">
                {steps.map((step, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Step {step.step}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateStep(index, "title", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(index, "description", e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={step.icon}
                                    onChange={(e) => updateStep(index, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Platform Hubs Editor Component
function PlatformHubsEditor({ hubs, onChange }: { hubs: HubCard[]; onChange: (hubs: HubCard[]) => void }) {
    const updateHub = (index: number, field: keyof HubCard, value: string) => {
        const updated = [...hubs];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Hubs</h2>
            <div className="space-y-6">
                {hubs.map((hub, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{hub.title}</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={hub.title}
                                    onChange={(e) => updateHub(index, "title", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={hub.icon}
                                    onChange={(e) => updateHub(index, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={hub.description}
                                    onChange={(e) => updateHub(index, "description", e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Link</label>
                                <input
                                    type="text"
                                    value={hub.href}
                                    onChange={(e) => updateHub(index, "href", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Stats Badge</label>
                                <input
                                    type="text"
                                    value={hub.stats || ""}
                                    onChange={(e) => updateHub(index, "stats", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Stats Editor Component
function StatsEditor({ stats, onChange }: { stats: StatItem[]; onChange: (stats: StatItem[]) => void }) {
    const updateStat = (index: number, field: keyof StatItem, value: string) => {
        const updated = [...stats];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Statistics</h2>
            <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={stat.icon}
                                    onChange={(e) => updateStat(index, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Value</label>
                                <input
                                    type="text"
                                    value={stat.value}
                                    onChange={(e) => updateStat(index, "value", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Label</label>
                                <input
                                    type="text"
                                    value={stat.label}
                                    onChange={(e) => updateStat(index, "label", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Why Choose Us Editor Component
function WhyChooseUsEditor({ items, onChange }: { items: WhyChooseItem[]; onChange: (items: WhyChooseItem[]) => void }) {
    const updateItem = (index: number, field: keyof WhyChooseItem, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Choose Us</h2>
            <div className="space-y-6">
                {items.map((item, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateItem(index, "title", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={item.icon}
                                    onChange={(e) => updateItem(index, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Core Quote Editor Component
function CoreQuoteEditor({ quote, onChange }: { quote: Quote; onChange: (quote: Quote) => void }) {
    const updateQuote = (field: keyof Quote, value: string) => {
        onChange({ ...quote, [field]: value });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Core Quote</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Quote Text</label>
                    <textarea
                        value={quote.text}
                        onChange={(e) => updateQuote("text", e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
                        <input
                            type="text"
                            value={quote.author}
                            onChange={(e) => updateQuote("author", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Role/Designation</label>
                        <input
                            type="text"
                            value={quote.role}
                            onChange={(e) => updateQuote("role", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// How It Works Editor Component
function HowItWorksEditor({ steps, onChange }: { steps: HowItWorksStep[]; onChange: (steps: HowItWorksStep[]) => void }) {
    const updateStep = (index: number, field: keyof HowItWorksStep, value: string | number) => {
        const updated = [...steps];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">How It Works</h2>
            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Step {step.step}</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateStep(index, "title", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={step.icon}
                                    onChange={(e) => updateStep(index, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(index, "description", e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Key Features Editor Component
function KeyFeaturesEditor({ features, onChange }: { features: KeyFeature[]; onChange: (features: KeyFeature[]) => void }) {
    const updateFeature = (index: number, field: keyof KeyFeature, value: string) => {
        const updated = [...features];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={feature.title}
                                    onChange={(e) => updateFeature(index, "title", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon/Emoji</label>
                                <input
                                    type="text"
                                    value={feature.icon}
                                    onChange={(e) => updateFeature(index, "icon", e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={feature.description}
                                    onChange={(e) => updateFeature(index, "description", e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Success Stories Editor Component
function SuccessStoriesEditor({
    title,
    subtitle,
    onTitleChange,
    onSubtitleChange,
}: {
    title: string;
    subtitle: string;
    onTitleChange: (title: string) => void;
    onSubtitleChange: (subtitle: string) => void;
}) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Success Stories Section</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Section Subtitle</label>
                    <textarea
                        value={subtitle}
                        onChange={(e) => onSubtitleChange(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
