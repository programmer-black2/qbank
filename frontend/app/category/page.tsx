"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BreadcrumbItem,
  CategoryNode,
  getCategoryBreadcrumb,
  getCategoryTree,
} from "@/services/core/core.api";

type BreadcrumbParams = {
  exam_type_id?: number;
  year_id?: number;
  course_id?: number;
  stage_id?: number;
};

type CategoryLevel = {
  title: string;
  description: string;
  nodes: CategoryNode[];
  level: number;
};

type CategoryCardProps = {
  node: CategoryNode;
  isSelected: boolean;
  onSelect: (node: CategoryNode) => void;
};

const typeLabels: Record<CategoryNode["type"], string> = {
  stage: "مقطع",
  course: "درس",
  year: "سال",
  exam_type: "نوع آزمون",
};

const typeStyles: Record<CategoryNode["type"], string> = {
  stage: "border-blue-100 bg-blue-50 text-blue-700",
  course: "border-emerald-100 bg-emerald-50 text-emerald-700",
  year: "border-violet-100 bg-violet-50 text-violet-700",
  exam_type: "border-amber-100 bg-amber-50 text-amber-700",
};

const getNodeKey = (node: CategoryNode) => `${node.type}-${node.id}`;

const getBreadcrumbParams = (node: CategoryNode): BreadcrumbParams => {
  switch (node.type) {
    case "stage":
      return { stage_id: node.metadata?.stage_id ?? node.id };
    case "course":
      return { course_id: node.metadata?.course_id ?? node.id };
    case "year":
      return { year_id: node.metadata?.year_id ?? node.id };
    case "exam_type":
      return { exam_type_id: node.id };
  }
};

function CategoryBreadcrumb({
  apiItems,
  selectedPath,
  loading,
}: {
  apiItems: BreadcrumbItem[];
  selectedPath: CategoryNode[];
  loading: boolean;
}) {
  if (selectedPath.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-medium text-slate-500 shadow-sm">
        ابتدا یکی از دسته‌بندی‌های اصلی را انتخاب کنید.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
        در حال دریافت مسیر دسته‌بندی...
      </div>
    );
  }

  const items =
    apiItems.length > 0
      ? apiItems
      : selectedPath.map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type,
        }));

  return (
    <nav
      aria-label="مسیر دسته‌بندی"
      className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
        {items.map((item, index) => (
          <li key={`${item.type}-${item.id}`} className="flex items-center gap-2">
            <span
              className={
                index === items.length - 1 ? "text-blue-700" : "text-slate-500"
              }
            >
              {item.name}
            </span>
            {index < items.length - 1 && <span className="text-slate-300">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CategoryCard({ node, isSelected, onSelect }: CategoryCardProps) {
  const childCount = node.children?.length ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className={`group flex min-h-36 w-full flex-col justify-between rounded-2xl border bg-white p-5 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${
        isSelected ? "border-blue-400 shadow-blue-100" : "border-slate-100"
      }`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              typeStyles[node.type]
            }`}
          >
            {typeLabels[node.type]}
          </span>

          {node.type === "exam_type" && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {node.question_count ?? 0} سوال
            </span>
          )}
        </div>

        <h3 className="text-lg font-black leading-8 text-slate-900">
          {node.name}
        </h3>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold">
        <span className={childCount > 0 ? "text-slate-500" : "text-slate-400"}>
          {childCount > 0 ? `${childCount} زیرمجموعه` : "پایان این شاخه"}
        </span>
        <span className="text-blue-600 transition-transform group-hover:-translate-x-1">
          {childCount > 0 ? "مشاهده زیرمجموعه" : "انتخاب"}
        </span>
      </div>
    </button>
  );
}

function CategorySection({
  title,
  description,
  nodes,
  selectedNode,
  onSelect,
}: {
  title: string;
  description: string;
  nodes: CategoryNode[];
  selectedNode?: CategoryNode;
  onSelect: (node: CategoryNode) => void;
}) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="mb-5 space-y-2 border-b border-slate-100 pb-5">
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">{title}</h2>
        <p className="text-sm font-medium leading-7 text-slate-500">
          {description}
        </p>
      </div>

      <CategoryChildrenList
        nodes={nodes}
        selectedNode={selectedNode}
        onSelect={onSelect}
      />
    </section>
  );
}

function CategoryChildrenList({
  nodes,
  selectedNode,
  onSelect,
}: {
  nodes: CategoryNode[];
  selectedNode?: CategoryNode;
  onSelect: (node: CategoryNode) => void;
}) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-8 text-center text-sm font-bold text-slate-500">
        زیرمجموعه‌ای برای نمایش وجود ندارد.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {nodes.map((node) => (
        <CategoryCard
          key={getNodeKey(node)}
          node={node}
          isSelected={selectedNode ? getNodeKey(selectedNode) === getNodeKey(node) : false}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<CategoryNode[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbLoading, setBreadcrumbLoading] = useState(false);
  const [error, setError] = useState("");
  const [breadcrumbError, setBreadcrumbError] = useState("");

  const visibleLevels = useMemo<CategoryLevel[]>(() => {
    const levels: CategoryLevel[] = [
      {
        title: "دسته‌بندی‌های اصلی",
        description: "ابتدا یکی از شاخه‌های اصلی را انتخاب کنید.",
        nodes: categories,
        level: 0,
      },
    ];

    selectedPath.forEach((node, index) => {
      if (!node.children || node.children.length === 0) {
        return;
      }

      levels.push({
        title: `زیرمجموعه‌های ${node.name}`,
        description: "برای رفتن به سطح بعدی، یکی از گزینه‌های این بخش را انتخاب کنید.",
        nodes: node.children,
        level: index + 1,
      });
    });

    return levels;
  }, [categories, selectedPath]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getCategoryTree();

        if (isMounted) {
          setCategories(data);
        }
      } catch {
        if (isMounted) {
          setError("دریافت دسته‌بندی‌ها با خطا مواجه شد.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectNode = async (node: CategoryNode, level: number) => {
    const nextPath = [...selectedPath.slice(0, level), node];

    setSelectedPath(nextPath);
    setBreadcrumb([]);
    setBreadcrumbError("");

    try {
      setBreadcrumbLoading(true);
      const data = await getCategoryBreadcrumb(getBreadcrumbParams(node));
      setBreadcrumb(data);
    } catch {
      setBreadcrumbError("مسیر این دسته‌بندی قابل دریافت نیست.");
    } finally {
      setBreadcrumbLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-10 text-right md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            بانک سؤال دنتست
          </span>

          <div className="space-y-3">
            <h1 className="text-3xl font-black leading-[1.5] text-slate-950 md:text-5xl">
              دسته‌بندی سوالات
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-7 text-slate-500 md:text-base">
              هر شاخه را انتخاب کنید تا فرزندهای همان شاخه در بخش بعدی نمایش
              داده شوند.
            </p>
          </div>
        </header>

        <CategoryBreadcrumb
          apiItems={breadcrumb}
          selectedPath={selectedPath}
          loading={breadcrumbLoading}
        />

        {breadcrumbError && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
            {breadcrumbError}
          </div>
        )}

        {loading && (
          <div className="rounded-[28px] border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
            <p className="font-bold text-slate-600">در حال دریافت دسته‌بندی‌ها...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-8 text-center">
            <h2 className="mb-2 text-lg font-black text-red-700">
              خطا در دریافت اطلاعات
            </h2>
            <p className="font-medium text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-[28px] border border-slate-100 bg-white p-10 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-black text-slate-800">
              هنوز دسته‌بندی‌ای ثبت نشده است
            </h2>
            <p className="font-medium text-slate-500">
              پس از ثبت دسته‌بندی‌ها در پنل مدیریت، اینجا نمایش داده می‌شوند.
            </p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="space-y-6">
            {visibleLevels.map((level) => (
              <CategorySection
                key={level.level}
                title={level.title}
                description={level.description}
                nodes={level.nodes}
                selectedNode={selectedPath[level.level]}
                onSelect={(node) => handleSelectNode(node, level.level)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
