"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CategoryFormDialog } from "@/components/menu/category-form-dialog";
import { ItemCard } from "@/components/menu/item-card";
import { ItemEditModal } from "@/components/menu/item-edit-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

type LocaleFields = {
  en: string;
  fr: string;
  ar: string;
};

type Category = {
  id: string;
  name: LocaleFields;
  sort_order: number;
  is_available: boolean;
  items: Item[];
};

type Item = {
  id: string;
  category_id: string;
  name: LocaleFields;
  description: LocaleFields;
  price: number;
  image_url: string | null;
  sort_order: number;
  is_available: boolean;
};

function findCategoryByItemId(
  categories: Category[],
  itemId: string
): Category | undefined {
  return categories.find((cat) =>
    cat.items.some((item) => item.id === itemId)
  );
}

function SortableCategory({
  category,
  onToggleAvailability,
  onDelete,
  onEditCategory,
  onAddItem,
  onToggleItemAvailability,
  onEditItem,
  onDeleteItem,
  itemIds,
}: {
  category: Category;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
  onDelete: (id: string) => void;
  onEditCategory: (category: Category) => void;
  onAddItem: (categoryId: string) => void;
  onToggleItemAvailability: (id: string, isAvailable: boolean) => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  itemIds: string[];
}) {
  const { locale } = useLanguage();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4 rounded-md border border-border bg-surface">
      <div className="flex flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab touch-none text-text-muted hover:text-text-primary"
            {...attributes}
            {...listeners}
            aria-label={t(locale, "menu.dragToReorder")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="18" x2="16" y2="18" />
            </svg>
          </button>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              {category.name.en}
            </h3>
            <p className="text-xs text-text-muted">
              {category.name.fr} / {category.name.ar} &middot;{" "}
              {category.items.length} item{category.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{t(locale, "menu.category")}</span>
            <Switch
              checked={category.is_available}
              onChange={(checked) => onToggleAvailability(category.id, checked)}
            />
          </div>

          <Button
            variant="ghost"
            className="h-8 w-8 min-w-0 p-0"
            onClick={() => onEditCategory(category)}
            aria-label={`${t(locale, "common.edit")} ${category.name.en}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>

          <Button
            variant="ghost"
            className="h-8 w-8 min-w-0 p-0 text-status-error hover:text-status-error"
            onClick={() => onDelete(category.id)}
            aria-label={`${t(locale, "common.delete")} ${category.name.en}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="border-t border-border p-4">
        {category.items.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-muted">
            {t(locale, "menu.noItems")}
          </p>
        ) : (
          <div className={!category.is_available ? "pointer-events-none opacity-60" : ""}>
            <SortableContext
              items={itemIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {category.items.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    onToggleAvailability={onToggleItemAvailability}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        <Button
          variant="secondary"
          className="mt-3 w-full"
          onClick={() => onAddItem(category.id)}
        >
          {t(locale, "menu.addItem")}
        </Button>
      </div>
    </div>
  );
}

function SortableItem({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
}: {
  item: Item;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}) {
  const { locale } = useLanguage();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItemCard
        item={item}
        onToggleAvailability={onToggleAvailability}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={
          <button
            className="cursor-grab touch-none text-text-muted hover:text-text-primary"
            {...attributes}
            {...listeners}
            aria-label={t(locale, "menu.dragToReorder")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="18" x2="16" y2="18" />
            </svg>
          </button>
        }
      />
    </div>
  );
}

export function MenuEditor() {
  const { locale } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState<string | null>(null);

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const supabase = useMemo(() => createClient(), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/menu/categories");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCategories(
        (json.data as Category[]).map((cat) => ({
          ...cat,
          items: (cat.items ?? []).sort(
            (a: Item, b: Item) => a.sort_order - b.sort_order
          ),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "menu.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const current = categoriesRef.current;
      const isCategory = current.some((c) => c.id === active.id);

      if (isCategory) {
        const oldIndex = current.findIndex((c) => c.id === active.id);
        const newIndex = current.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const previous = [...current];
        const reordered = [...current];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const updated = reordered.map((cat, i) => ({
          ...cat,
          sort_order: i,
        }));
        setCategories(updated);

        const res = await fetch("/api/menu/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: updated.map((cat) => ({
              id: cat.id,
              sort_order: cat.sort_order,
            })),
          }),
        });

        if (!res.ok) {
          setCategories(previous);
          setError(t(locale, "menu.reorderFailed"));
        }
      } else {
        const category = findCategoryByItemId(current, active.id as string);
        if (!category) return;

        const oldIndex = category.items.findIndex((i) => i.id === active.id);
        const newIndex = category.items.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const previous = [...current];
        const reordered = [...category.items];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const updated = reordered.map((item, i) => ({
          ...item,
          sort_order: i,
        }));

        setCategories((prev) =>
          prev.map((c) =>
            c.id === category.id ? { ...c, items: updated } : c
          )
        );

        const res = await fetch("/api/menu/items", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: updated.map((item) => ({
              id: item.id,
              sort_order: item.sort_order,
            })),
          }),
        });

        if (!res.ok) {
          setCategories(previous);
          setError(t(locale, "menu.reorderItemsFailed"));
        }
      }
    },
    [locale]
  );

  const handleCreateCategory = async (name: LocaleFields) => {
    const res = await fetch("/api/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchData();
  };

  const handleUpdateCategory = async (name: LocaleFields) => {
    if (!editingCategory) return;
    const res = await fetch(`/api/menu/categories/${editingCategory.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchData();
  };

  const handleToggleCategoryAvailability = async (
    id: string,
    isAvailable: boolean
  ) => {
    const previous = categoriesRef.current;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              is_available: isAvailable,
              items: cat.items.map((item) => ({
                ...item,
                is_available: isAvailable,
              })),
            }
          : cat
      )
    );

    const res = await fetch(`/api/menu/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: isAvailable }),
    });

    if (!res.ok) {
      setCategories(previous);
      setError(t(locale, "menu.availabilityFailed"));
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    setDeleting(true);
    const previous = categoriesRef.current;
    const id = deleteCategoryId;
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setDeleteCategoryId(null);

    const res = await fetch(`/api/menu/categories/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setCategories(previous);
      setError(t(locale, "menu.deleteFailed"));
    }
    setDeleting(false);
  };

  const handleCreateItem = async (data: {
    name: LocaleFields;
    description: LocaleFields;
    price: string;
    image_url: string | null;
    is_available: boolean;
  }) => {
    if (!itemCategoryId) return;
    const res = await fetch("/api/menu/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: itemCategoryId,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        image_url: data.image_url,
        is_available: data.is_available,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchData();
  };

  const handleUpdateItem = async (data: {
    name: LocaleFields;
    description: LocaleFields;
    price: string;
    image_url: string | null;
    is_available: boolean;
  }) => {
    if (!editingItem) return;
    const res = await fetch(`/api/menu/items/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        image_url: data.image_url,
        is_available: data.is_available,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    await fetchData();
  };

  const handleToggleItemAvailability = async (
    id: string,
    isAvailable: boolean
  ) => {
    const previous = categoriesRef.current;
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === id ? { ...item, is_available: isAvailable } : item
        ),
      }))
    );

    const res = await fetch(`/api/menu/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: isAvailable }),
    });

    if (!res.ok) {
      setCategories(previous);
      setError(t(locale, "menu.itemAvailabilityFailed"));
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    setDeleting(true);
    const previous = categoriesRef.current;
    const id = deleteItemId;
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.id !== id),
      }))
    );
    setDeleteItemId(null);

    const res = await fetch(`/api/menu/items/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setCategories(previous);
      setError(t(locale, "menu.deleteItemFailed"));
    }
    setDeleting(false);
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(`items/${fileName}`, file, {
        contentType: file.type,
        upsert: true,
      });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage
      .from("menu-images")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const openAddItem = (categoryId: string) => {
    setEditingItem(null);
    setItemCategoryId(categoryId);
    setItemModalOpen(true);
  };

  const openEditItem = (item: Item) => {
    setEditingItem(item);
    setItemCategoryId(item.category_id);
    setItemModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-text-muted">{t(locale, "menu.loadingMenu")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-status-error">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-sm border border-status-error bg-status-error/10 p-3 text-sm text-status-error">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => setError(null)}
          >
            {t(locale, "common.dismiss")}
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t(locale, "menu.title")}</h1>
          <p className="text-sm text-text-secondary">
            {t(locale, "menu.subtitle")}
          </p>
        </div>
        <Button onClick={openAddCategory}>{t(locale, "menu.addCategory")}</Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-text-primary">
            {t(locale, "menu.noCategories")}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {t(locale, "menu.noCategoriesDesc")}
          </p>
          <Button className="mt-4" onClick={openAddCategory}>
            {t(locale, "menu.addCategory")}
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {categories.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  itemIds={category.items.map((i) => i.id)}
                  onToggleAvailability={handleToggleCategoryAvailability}
                  onDelete={(id) => setDeleteCategoryId(id)}
                  onEditCategory={openEditCategory}
                  onAddItem={openAddItem}
                  onToggleItemAvailability={handleToggleItemAvailability}
                  onEditItem={openEditItem}
                  onDeleteItem={(id) => setDeleteItemId(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CategoryFormDialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false);
          setEditingCategory(null);
        }}
        onSave={
          editingCategory ? handleUpdateCategory : handleCreateCategory
        }
        initialValues={editingCategory?.name}
        title={editingCategory ? t(locale, "menu.editCategory") : t(locale, "menu.addCategoryTitle")}
      />

      <ItemEditModal
        open={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingItem(null);
          setItemCategoryId(null);
        }}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
        onUploadImage={handleUploadImage}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                description: editingItem.description,
                price: editingItem.price.toString(),
                image_url: editingItem.image_url,
                is_available: editingItem.is_available,
              }
            : undefined
        }
        title={editingItem ? t(locale, "menu.editItem") : t(locale, "menu.addItemTitle")}
      />

      <ConfirmDialog
        open={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
        title={t(locale, "menu.deleteCategory")}
        message={t(locale, "menu.deleteCategoryConfirm")}
        confirmLabel={t(locale, "menu.deleteCategory")}
        variant="danger"
        loading={deleting}
      />

      <ConfirmDialog
        open={deleteItemId !== null}
        onClose={() => setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
        title={t(locale, "menu.deleteItem")}
        message={t(locale, "menu.deleteItemConfirm")}
        confirmLabel={t(locale, "menu.deleteItem")}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
