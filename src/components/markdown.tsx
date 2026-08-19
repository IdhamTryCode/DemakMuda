import ReactMarkdown from "react-markdown";

/**
 * Penampil isi Markdown.
 *
 * react-markdown tidak merender HTML mentah kecuali diberi plugin rehype-raw.
 * Plugin itu sengaja TIDAK dipasang, sehingga isi kiriman pengguna tidak
 * pernah bisa menyisipkan skrip. Jangan menambahkannya.
 */
export function Markdown({ isi }: { isi: string }) {
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-ink-soft">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h2 className="mt-2 text-xl font-semibold text-ink">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="mt-2 text-lg font-semibold text-ink">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-2 text-base font-semibold text-ink">{children}</h4>
          ),
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => (
            <ul className="flex list-disc flex-col gap-1.5 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="flex list-decimal flex-col gap-1.5 pl-5">{children}</ol>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brass pl-4 italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="text-accent underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-sunk px-1.5 py-0.5 font-mono text-[13px]">
              {children}
            </code>
          ),
        }}
      >
        {isi}
      </ReactMarkdown>
    </div>
  );
}
