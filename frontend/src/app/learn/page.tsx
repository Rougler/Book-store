import Link from "next/link";

export const metadata = {
  title: "Gyaan Hub",
  description: "Expand your knowledge with our comprehensive learning resources",
};

const learningCategories = [
  {
    icon: "📖",
    title: "Books & Resources",
    description: "Access a vast library of books covering business, personal development, technology, and more.",
    color: "from-indigo-500 to-purple-600",
    stats: "500+ Books",
  },
  {
    icon: "🎓",
    title: "Online Courses",
    description: "Learn from industry experts through structured courses designed for practical application.",
    color: "from-emerald-500 to-teal-600",
    stats: "50+ Courses",
  },
  {
    icon: "👨‍🏫",
    title: "Mentorship Programs",
    description: "Get personalized guidance from experienced mentors to accelerate your learning journey.",
    color: "from-orange-500 to-red-600",
    stats: "1-on-1 Support",
  },
  {
    icon: "🎯",
    title: "Skill Workshops",
    description: "Hands-on workshops to build practical skills that matter in today's world.",
    color: "from-pink-500 to-rose-600",
    stats: "Live Sessions",
  },
  {
    icon: "📝",
    title: "Study Notes",
    description: "Comprehensive notes and summaries to help you retain knowledge effectively.",
    color: "from-cyan-500 to-blue-600",
    stats: "Quick Revisions",
  },
  {
    icon: "🏆",
    title: "Certifications",
    description: "Earn recognized certificates upon completing courses and assessments.",
    color: "from-amber-500 to-orange-600",
    stats: "Verified Certs",
  },
];

const featuredTopics = [
  { name: "Personal Development", icon: "🧠", count: 120 },
  { name: "Financial Literacy", icon: "💰", count: 85 },
  { name: "Business Strategy", icon: "📈", count: 95 },
  { name: "Leadership Skills", icon: "🚀", count: 65 },
  { name: "Communication", icon: "💬", count: 45 },
  { name: "Health & Wellness", icon: "❤️", count: 55 },
];

export default function LearnPage() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 px-6 py-2 text-sm font-medium text-indigo-700 mb-6">
              <span className="text-xl">🧠</span>
              Gyaan Hub - Learning Center
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent sm:text-5xl lg:text-6xl mb-6">
              Unlock Your Potential
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed">
              Expand your knowledge with our comprehensive learning resources. From books to courses,
              mentorship to certifications - everything you need to transform your life.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "500+", label: "Books", icon: "📚" },
              { value: "50+", label: "Courses", icon: "🎓" },
              { value: "10K+", label: "Learners", icon: "👥" },
              { value: "98%", label: "Satisfaction", icon: "⭐" },
            ].map((stat) => (
              <div key={stat.label} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Learning Resources
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Choose from a variety of learning formats designed to fit your style and schedule
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningCategories.map((category, index) => (
            <div
              key={category.title}
              className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

              {/* Icon */}
              <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {category.icon}
              </div>

              {/* Stats Badge */}
              <div className="absolute top-6 right-6">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {category.stats}
                </span>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {category.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {category.description}
              </p>

              {/* Explore Link */}
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <span>Explore</span>
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Animated bottom border */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${category.color} transition-all duration-500 group-hover:w-full`} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Topics */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Popular Topics
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore the most sought-after subjects by our community
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredTopics.map((topic) => (
            <div
              key={topic.name}
              className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 text-center shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">
                {topic.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{topic.name}</h3>
              <p className="text-xs text-slate-500">{topic.count} Resources</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2.5rem] blur opacity-20" />
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 rounded-3xl p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium text-white/80 mb-6">
                  <span className="text-lg">🚀</span>
                  Your Learning Journey
                </div>
                <h2 className="text-3xl font-bold text-white mb-6 sm:text-4xl">
                  Start Your Transformation Today
                </h2>
                <p className="text-slate-300 leading-relaxed mb-8">
                  Browse our collection of premium books and resources. Begin your journey towards
                  knowledge, wisdom, and personal growth.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/browse"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
                  >
                    Browse Books
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/20"
                  >
                    Join Free
                  </Link>
                </div>
              </div>

              {/* Learning Steps */}
              <div className="space-y-4">
                {[
                  { step: 1, title: "Choose Your Path", desc: "Select topics that interest you" },
                  { step: 2, title: "Learn at Your Pace", desc: "Access resources anytime, anywhere" },
                  { step: 3, title: "Apply & Grow", desc: "Implement knowledge in real life" },
                  { step: 4, title: "Earn & Succeed", desc: "Share knowledge and build income" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
