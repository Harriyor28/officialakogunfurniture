"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function PortfolioFilters({
  categories,
  statuses,
}: {
  categories: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/portfolio?${params.toString()}`);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (search.trim()) params.set("q", search.trim());
        else params.delete("q");
        params.delete("page");
        router.push(`/portfolio?${params.toString()}`);
      }}
    >
      <div className="min-w-56 flex-1">
        <label htmlFor="portfolio-search" className="label">Search projects</label>
        <input
          id="portfolio-search"
          type="search"
          className="input"
          placeholder="Search by project name…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="min-w-48">
        <label htmlFor="portfolio-category" className="label">Category</label>
        <select
          id="portfolio-category"
          className="input"
          value={searchParams.get("category") ?? ""}
          onChange={(event) => updateParam("category", event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </div>

      <div className="min-w-44">
        <label htmlFor="portfolio-status" className="label">Status</label>
        <select
          id="portfolio-status"
          className="input"
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateParam("status", event.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      <div className="min-w-40">
        <label htmlFor="portfolio-sort" className="label">Sort</label>
        <select
          id="portfolio-sort"
          className="input"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(event) => updateParam("sort", event.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="featured">Featured first</option>
        </select>
      </div>

      <button type="submit" className="btn btn-secondary">Apply</button>
    </form>
  );
}
