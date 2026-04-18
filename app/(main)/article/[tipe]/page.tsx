import { notFound } from "next/navigation";

import ArticleListPage, {
  type ArticleListType,
} from "@/features/article/components/ArticleListPage";

const ALLOWED_TYPES = ["kronik", "tilik", "diskursus"] as const;

type AllowedType = (typeof ALLOWED_TYPES)[number];

interface ArticleTypePageProps {
  params: {
    tipe: string;
  };
}

export default function ArticleTypePage({ params }: ArticleTypePageProps) {
  const tipe = params.tipe as ArticleListType;

  if (!ALLOWED_TYPES.includes(tipe as AllowedType)) {
    notFound();
  }

  return <ArticleListPage type={tipe} />;
}
