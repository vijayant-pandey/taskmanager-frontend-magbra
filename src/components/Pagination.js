import React from "react";

const Pagination = ({ page, pages, setPage }) => {
  if (pages <= 1) return null;

  const items = [];
  for (let i = 1; i <= pages; i++) {
    items.push(
      <li key={i} className={`page-item ${i === page ? "active" : ""}`}>
        <button className="page-link" onClick={() => setPage(i)}>{i}</button>
      </li>
    );
  }

  return <ul className="pagination">{items}</ul>;
};

export default Pagination;
