export default function CategoryCard({ title, imgSrc, to = '/?category', className = '' }) {
  return (
    <a
      href={to}
      className={`group block overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-neutral-200 transition hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="px-4 py-3">
        <p className="text-lg font-semibold">{title}</p>
      </div>
    </a>
  )
}
