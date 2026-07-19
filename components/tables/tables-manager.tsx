"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableCard, type TableData } from "@/components/tables/table-card";
import { AddTableDialog } from "@/components/tables/add-table-dialog";
import { EditTableDialog } from "@/components/tables/edit-table-dialog";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type ApiErrorResponse = { error: string; code?: string };

export function TablesManager() {
  const { locale } = useLanguage();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [clearTarget, setClearTarget] = useState<TableData | null>(null);
  const [clearing, setClearing] = useState(false);

  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch("/api/tables");
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(err.error);
      }
      const json: { data: TableData[] } = await res.json();
      setTables(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "table.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (channelRef.current) return;
    if (tables.length === 0) return;

    const locationId = tables[0].location_id;
    const setUpChannel = async () => {
      const supabase = createClient();
      await supabase.auth.getSession();
      const channel = supabase
        .channel(`tables-location-${locationId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sessions",
            filter: `location_id=eq.${locationId}`,
          },
          () => {
            fetchTables();
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setUpChannel();

    return () => {
      if (channelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.length > 0 && tables[0]?.location_id]);

  const handleAdd = async (label: string) => {
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) {
      const err: ApiErrorResponse = await res.json();
      throw new Error(err.error);
    }
    await fetchTables();
  };

  const handleUpdate = async (data: { label?: string; is_active?: boolean }) => {
    if (!editingTable) return;
    const res = await fetch(`/api/tables/${editingTable.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err: ApiErrorResponse = await res.json();
      throw new Error(err.error);
    }
    setEditingTable(null);
    await fetchTables();
  };

  const handleDelete = async () => {
    if (!deleteTableId) return;
    setDeleting(true);
    const previous = tablesRef.current;
    const id = deleteTableId;
    setTables((prev) => prev.filter((t) => t.id !== id));
    setDeleteTableId(null);

    const res = await fetch(`/api/tables/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err: ApiErrorResponse = await res.json();
      setTables(previous);
      setError(err.error ?? t(locale, "table.failedToDelete"));
    }
    setDeleting(false);
  };

  // Force-closes the table's active session so it becomes available again.
  // This is the resolution path for the blocked "Are you with [name]? -> No"
  // customer state — see app/api/sessions/[id]/route.ts.
  const handleClearTable = async () => {
    if (!clearTarget?.active_session_id) return;
    setClearing(true);
    try {
      const res = await fetch(`/api/sessions/${clearTarget.active_session_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err: ApiErrorResponse = await res.json();
        throw new Error(err.error);
      }
      setClearTarget(null);
      await fetchTables();
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "table.failedToClear"));
    } finally {
      setClearing(false);
    }
  };

  const handleDownloadAll = () => {
    if (tables.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrPromises = tables
      .filter((t): t is TableData & { qr_code_url: string } => !!t.qr_code_url)
      .map(async (table) => {
        const QRCode = (await import("qrcode")).default;
        const svg = await QRCode.toString(table.qr_code_url, {
          type: "svg",
          width: 300,
          margin: 1,
        });
        return { label: table.label, svg };
      });

    Promise.all(qrPromises)
      .then((results) => {
        const qrCards = results
          .map(
            (r) => `
        <div style="
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          page-break-inside: avoid;
        ">
          ${r.svg}
          <p style="margin-top: 8px; font-family: sans-serif; font-size: 14px; color: #111827;">
            ${r.label}
          </p>
        </div>
      `
          )
          .join("");

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${t(locale, "table.downloadPrint")}</title>
          <style>
            @page { margin: 10mm; }
            body { font-family: sans-serif; }
            .grid {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              justify-content: center;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="grid">${qrCards}</div>
          <script>window.print();window.close();</script>
        </body>
        </html>
      `);
        printWindow.document.close();
      })
      .catch(() => {
        printWindow.close();
        setError(t(locale, "table.downloadFailed"));
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-text-muted">{t(locale, "table.loadingTables")}</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-sm border border-status-error bg-status-error/10 p-3 text-sm text-status-error">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            {t(locale, "common.dismiss")}
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t(locale, "table.title")}</h1>
          <p className="text-sm text-text-secondary">
            {t(locale, "table.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          {tables.length > 0 && (
            <Button variant="secondary" onClick={handleDownloadAll}>
              {t(locale, "table.downloadAll")}
            </Button>
          )}
          <Button onClick={() => setAddDialogOpen(true)}>{t(locale, "table.addTable")}</Button>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-text-primary">
            {t(locale, "table.noTables")}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {t(locale, "table.noTablesDesc")}
          </p>
          <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
            {t(locale, "table.addTable")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={setEditingTable}
              onDelete={(id) => setDeleteTableId(id)}
              onClearTable={setClearTarget}
            />
          ))}
        </div>
      )}

      <AddTableDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAdd}
      />

      {editingTable && (
        <EditTableDialog
          open={editingTable !== null}
          onClose={() => setEditingTable(null)}
          onSave={handleUpdate}
          table={editingTable}
        />
      )}

      <ConfirmDialog
        open={deleteTableId !== null}
        onClose={() => setDeleteTableId(null)}
        onConfirm={handleDelete}
        title={t(locale, "table.deleteTitle")}
        message={t(locale, "table.deleteConfirm")}
        confirmLabel={t(locale, "table.deleteTitle")}
        variant="danger"
        loading={deleting}
      />

      <ConfirmDialog
        open={clearTarget !== null}
        onClose={() => setClearTarget(null)}
        onConfirm={handleClearTable}
        title={t(locale, "table.clearTableTitle")}
        message={t(locale, "table.clearTableConfirm", { label: clearTarget?.label ?? "" })}
        confirmLabel={t(locale, "table.clearTableTitle")}
        loadingLabel={t(locale, "table.clearing")}
        variant="danger"
        loading={clearing}
      />
    </div>
  );
}
