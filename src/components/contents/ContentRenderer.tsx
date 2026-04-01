import React from 'react';

import type { TiptapNode } from '@/src/utils/voice';

type Props = {
  nodes: TiptapNode[];
};

type InlineNode = {
  type: string;
  text?: string;
  marks?: { type: string }[];
};

function renderInline(inlines: InlineNode[] | undefined) {
  if (!inlines || inlines.length === 0) return null;

  return inlines.map((n, idx) => {
    const text = n.text ?? '';
    const isBold = n.marks?.some(m => m.type === 'bold');

    if (isBold) {
      return (
        <strong key={idx} className="font-semibold text-zinc-900">
          {text}
        </strong>
      );
    }

    return (
      <span key={idx} className="text-zinc-800">
        {text}
      </span>
    );
  });
}

function Heading({
  level,
  children,
}: {
  level: number;
  children: React.ReactNode;
}) {
  if (level === 1) {
    return (
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 leading-tight">
        {children}
      </h1>
    );
  }
  if (level === 2) {
    return <h2 className="text-xl font-bold text-zinc-900 mt-8">{children}</h2>;
  }
  return <h3 className="text-lg font-bold text-zinc-900 mt-6">{children}</h3>;
}

export function ContentRenderer({ nodes }: Props) {
  return (
    <article className="max-w-3xl">
      <div className="space-y-4">
        {nodes.map((node, idx) => {
          if (node.type === 'heading') {
            const level =
              typeof node.attrs?.level === 'number' ? node.attrs.level : 1;
            return (
              <Heading key={idx} level={level}>
                {renderInline(node.content as InlineNode[])}
              </Heading>
            );
          }

          if (node.type === 'paragraph') {
            return (
              <p key={idx} className="text-base leading-7 text-zinc-700">
                {renderInline(node.content as InlineNode[])}
              </p>
            );
          }

          if (node.type === 'blockquote') {
            const inner = Array.isArray(node.content)
              ? (node.content as TiptapNode[])
              : [];
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-zinc-200 bg-zinc-50 px-4 py-3 rounded-r-2xl"
              >
                <div className="space-y-2">
                  {inner.map((child, childIdx) => {
                    if (child.type === 'paragraph') {
                      return (
                        <p
                          key={childIdx}
                          className="text-sm leading-6 text-zinc-700"
                        >
                          {renderInline(child.content as InlineNode[])}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </blockquote>
            );
          }

          return null;
        })}
      </div>
    </article>
  );
}
