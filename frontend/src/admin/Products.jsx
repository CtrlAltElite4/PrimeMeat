import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiAlertTriangle,
  FiBox,
  FiCheck,
  FiEdit2,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../api";
import productImage from "../utils/productImage";
import { PRODUCT_STATUS_LABELS, formatNumber, formatRand } from "./format";
import StatusPill from "./StatusPill";
import ProductFormModal from "./ProductFormModal";
import ProductTypeModal from "./ProductTypeModal";
import CarcassTypeModal from "./CarcassTypeModal";
import CarcassProductFormModal from "./CarcassProductFormModal";
import GroupOrderProductFormModal from "./GroupOrderProductFormModal";
import {
  ConfirmModal,
  FilterSelect,
  MiniStat,
  PageHeader,
  Pagination,
  SearchBox,
} from "./ui";

const STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

/** On/off switch for the Availability column */
function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`adm-switch${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const status = params.get("status") ?? "";
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);

  const [stats, setStats] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // product object, or 'new'
  const [deleting, setDeleting] = useState(null); // product object
  const [choosingType, setChoosingType] = useState(false);
  const [editingGroupOrderProduct, setEditingGroupOrderProduct] =
    useState(null);
  const [choosingCarcassType, setChoosingCarcassType] = useState(false);
  const [productFormOptions, setProductFormOptions] = useState({
    productType: "fixed_price",
    showGrade: false,
    carcassType: "",
  });
  const [editingCarcass, setEditingCarcass] = useState(null);
  const [carcassAnimalType, setCarcassAnimalType] = useState("Beef");

  const setFilter = useCallback(
    (key, value) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setParams],
  );

  const onSearch = useCallback(
    (value) => setFilter("search", value),
    [setFilter],
  );

  const loadStats = useCallback(() => {
    api
      .get("/api/admin/products/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/admin/products", {
        params: {
          search: search || undefined,
          category: category || undefined,
          status: status || undefined,
          page,
        },
      });
      setResult(data);
    } catch {
      setError("Couldn't load products. Check that Laravel is running.");
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const replaceRow = (updated) => {
    setResult((r) => ({
      ...r,
      data: r.data.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const toggleAvailability = async (product, isActive) => {
    setBusyId(product.id);
    setNotice("");
    try {
      const { data } = await api.patch(
        `/api/admin/products/${product.id}/availability`,
        { is_active: isActive },
      );
      replaceRow(data);
      loadStats();
    } catch {
      setNotice("Couldn't change availability. Try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = (saved, wasEdit) => {
    setEditing(null);
    setNotice(
      wasEdit ? `${saved.name} was updated.` : `${saved.name} was added.`,
    );
    if (wasEdit) replaceRow(saved);
    else loadProducts();
    loadStats();
  };
  // Refresh the product list after saving a carcass.
  const handleCarcassSaved = async (data) => {
    setEditingCarcass(null);
    setNotice(data.message || "Carcass product saved successfully.");
    await Promise.all([loadProducts(), loadStats()]);
  };
  // Open the correct form based on the administrator's product-type selection.
  const handleTypeSelected = (type) => {
    setChoosingType(false);

    if (type === "group_order") {
      setEditingGroupOrderProduct("new");
      return;
    }

    if (type === "carcass") {
      setChoosingCarcassType(true);
      return;
    }

    setProductFormOptions({
      productType: "fixed_price",
      showGrade: false,
      carcassType: "",
    });
    setEditing("new");
  };

  // Open the carcass form with the correct grade setting.
  // Open the dedicated carcass form for the selected animal type.
  const handleCarcassSelected = (animal) => {
    setChoosingCarcassType(false);
    setCarcassAnimalType(animal);
    setEditingCarcass("new");
  };
  const confirmDelete = async () => {
    await api.delete(`/api/admin/products/${deleting.id}`);
    setNotice(`${deleting.name} was deleted. Past orders still show it.`);
    setDeleting(null);
    loadProducts();
    loadStats();
  };

  const products = result?.data ?? [];
  const categoryOptions = (stats?.categories ?? []).map((c) => ({
    value: c,
    label: c,
  }));

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage products by adding, editing or deleting products."
        action={
          <button
            type="button"
            className="adm-btn adm-btn--big"
            onClick={() => setChoosingType(true)}
          >
            <FiPlus aria-hidden="true" /> Add Product
          </button>
        }
      />

      <section
        className="adm-minis adm-minis--five"
        aria-label="Product figures"
      >
        <MiniStat
          icon={FiBox}
          label="Total products"
          value={stats && formatNumber(stats.total)}
          note="All products in store"
        />
        <MiniStat
          icon={FiCheck}
          label="Active"
          value={stats && formatNumber(stats.active)}
          note="Available for purchase"
        />
        <MiniStat
          icon={FiFileText}
          label="Draft"
          value={stats && formatNumber(stats.draft)}
          note="Not published yet"
        />
        <MiniStat
          icon={FiAlertTriangle}
          label="Low stock"
          value={stats && formatNumber(stats.low_stock)}
          note={
            stats
              ? `${stats.low_stock_level} or fewer left`
              : "Requires attention"
          }
        />
        <MiniStat
          icon={FiX}
          label="Unavailable"
          value={stats && formatNumber(stats.unavailable)}
          note="Not available for purchase"
        />
      </section>

      <div className="adm-toolbar">
        <SearchBox
          placeholder="Search products…"
          initial={search}
          onSearch={onSearch}
        />
        <FilterSelect
          label="All categories"
          value={category}
          options={categoryOptions}
          onChange={(v) => setFilter("category", v)}
        />
        <FilterSelect
          label="All statuses"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(v) => setFilter("status", v)}
        />
      </div>

      {notice && (
        <p className="adm-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <div className="adm-alert" role="alert">
          {error}{" "}
          <button type="button" onClick={loadProducts}>
            Try again
          </button>
        </div>
      )}

      <section className="adm-card adm-card--flush adm-products-table">
        <div className="adm-table-wrap">
          <table className="adm-table adm-table--wrap">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Status</th>
                <th scope="col">Availability</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !result && (
                <tr>
                  <td colSpan="8" className="adm-table__empty">
                    Loading products…
                  </td>
                </tr>
              )}
              {result && products.length === 0 && (
                <tr>
                  <td colSpan="8" className="adm-table__empty">
                    No products match.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className={loading ? "is-stale" : ""}>
                  <td className="adm-nowrap">{p.code}</td>
                  <td>
                    <div className="adm-prod">
                      <span className="adm-prod__img">
                        {productImage(p) ? (
                          <img src={productImage(p)} alt="" />
                        ) : (
                          "IMG"
                        )}
                      </span>
                      <div>
                        <p className="adm-prod__name">{p.name}</p>
                        <p className="adm-prod__grade">Grade {p.grade}</p>
                        {p.description && (
                          <p className="adm-prod__desc">{p.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{p.category ?? "–"}</td>
                  <td className="adm-nowrap">{formatRand(p.price)}</td>
                  <td
                    className={
                      p.stock <= (stats?.low_stock_level ?? 10)
                        ? "adm-stock--low"
                        : ""
                    }
                  >
                    {p.stock}
                  </td>
                  <td>
                    <StatusPill status={p.display_status} />
                  </td>
                  <td>
                    {/* Off (and locked) whenever customers can't buy it: no stock or still a draft.
                        Add stock or publish the product first, then switch it on. */}
                    {(() => {
                      const canSell = p.status !== "draft" && p.stock > 0;
                      return (
                        <span
                          title={
                            canSell
                              ? ""
                              : p.status === "draft"
                                ? "Publish the product first"
                                : "Add stock first"
                          }
                        >
                          <Toggle
                            checked={p.is_active && canSell}
                            disabled={busyId === p.id || !canSell}
                            label={`${p.name} available for purchase`}
                            onChange={(on) => toggleAvailability(p, on)}
                          />
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button
                        type="button"
                        className="adm-view"
                        onClick={() => setEditing(p)}
                        aria-label={`Edit ${p.name}`}
                      >
                        <FiEdit2 aria-hidden="true" /> Edit
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => setDeleting(p)}
                        aria-label={`Delete ${p.name}`}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && (
          <Pagination
            page={result.current_page}
            lastPage={result.last_page}
            shown={products.length}
            total={result.total}
            noun="products"
            onPage={(n) => setFilter("page", String(n))}
          />
        )}
      </section>

      {editing && (
        <ProductFormModal
          product={editing === "new" ? null : editing}
          categories={stats?.categories ?? []}
          productType={
            editing === "new"
              ? productFormOptions.productType
              : (editing.product_type ?? "fixed_price")
          }
          showGrade={
            editing === "new"
              ? productFormOptions.showGrade
              : Boolean(editing.grade)
          }
          carcassType={editing === "new" ? productFormOptions.carcassType : ""}
          onClose={() => setEditing(null)}
          onBack={
            editing === "new"
              ? () => {
                  setEditing(null);
                  setChoosingType(true);
                }
              : undefined
          }
          onSaved={handleSaved}
        />
      )}

      {editingCarcass && (
        <CarcassProductFormModal
          product={editingCarcass === "new" ? null : editingCarcass}
          animalType={carcassAnimalType}
          categories={stats?.categories ?? []}
          onClose={() => setEditingCarcass(null)}
          onBack={
            editingCarcass === "new"
              ? () => {
                  setEditingCarcass(null);
                  setChoosingCarcassType(true);
                }
              : undefined
          }
          onSaved={handleCarcassSaved}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete product?"
          message={`${deleting.name} (Grade ${deleting.grade}) will be removed from the shop permanently. Past orders keep its name and price. To hide it temporarily, switch off Availability instead.`}
          confirmLabel="Delete product"
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
      {choosingType && (
        <ProductTypeModal
          onSelect={handleTypeSelected}
          onClose={() => setChoosingType(false)}
        />
      )}
      {choosingCarcassType && (
        <CarcassTypeModal
          onSelect={handleCarcassSelected}
          onClose={() => setChoosingCarcassType(false)}
          onBack={() => {
            setChoosingCarcassType(false);
            setChoosingType(true);
          }}
        />
      )}
      {editingGroupOrderProduct && (
        <GroupOrderProductFormModal
          product={
            editingGroupOrderProduct === "new" ? null : editingGroupOrderProduct
          }
          onClose={() => setEditingGroupOrderProduct(null)}
          onBack={
            editingGroupOrderProduct === "new"
              ? () => {
                  setEditingGroupOrderProduct(null);
                  setChoosingType(true);
                }
              : undefined
          }
          onSaved={(saved, wasEdit) => {
            setEditingGroupOrderProduct(null);
            setNotice(
              wasEdit
                ? `${saved.weight_range} kg package was updated.`
                : `${saved.weight_range} kg package was added.`,
            );
          }}
        />
      )}
    </>
  );
}
