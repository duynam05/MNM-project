function Icon({ name }) {
  const icons = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    book: (
      <>
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H20v15H7.5A2.5 2.5 0 0 0 5 21.5z" />
        <path d="M5 6.5V19a2 2 0 0 0 2 2h13" />
        <path d="M9 8h7" />
      </>
    ),
    users: (
      <>
        <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </>
    ),
    cart: (
      <>
        <circle cx="10" cy="20" r="1.75" />
        <circle cx="18" cy="20" r="1.75" />
        <path d="M3 4h2l2.1 10.4a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.76L21 8H7" />
      </>
    ),
    chart: (
      <>
        <path d="M5 19V11" />
        <path d="M12 19V5" />
        <path d="M19 19v-8" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.97 19.35a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.4a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9.02 4.6h.17A1.7 1.7 0 0 0 10.22 3H10.3a2 2 0 1 1 4 0h.09a1.7 1.7 0 0 0 1.56 1.03 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.35 8.4v.17A1.7 1.7 0 0 0 21 9.7h.09a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1.3Z" />
      </>
    ),
    clipboard: (
      <>
        <rect x="6" y="5" width="12" height="16" rx="2" />
        <path d="M9 5.5h6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 5.5Z" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="3" />
        <path d="M16 12h5v4h-5a2 2 0 1 1 0-4Z" />
      </>
    ),
    bell: (
      <>
        <path d="M8 18h8" />
        <path d="M10 21h4" />
        <path d="M18 15V11a6 6 0 1 0-12 0v4l-2 2h16Z" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v5" />
        <path d="M12 7.5h.01" />
      </>
    ),
    arrowDown: <path d="m7 10 5 5 5-5" />,
    export: (
      <>
        <path d="M12 4v10" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 20h14" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    spark: (
      <>
        <path d="m7 15 3-3 2 2 5-5" />
        <path d="M17 9h2v2" />
      </>
    ),
    logout: (
      <>
        <path d="M15 16l4-4-4-4" />
        <path d="M19 12H9" />
        <path d="M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.35-4.35" />
      </>
    ),
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5" />
      </>
    ),
    image: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m20 16-4.5-4.5L8 19" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V7" />
        <path d="m8 11 4-4 4 4" />
        <path d="M5 19h14" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    sort: (
      <>
        <path d="m8 7 4-4 4 4" />
        <path d="M12 3v18" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4.5-1 9-9a2 2 0 0 0-4-4l-9 9L4 20Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
        <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
        <path d="M9 7V4h6v3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 6 5.5V11c0 4.2 2.6 8 6 10 3.4-2 6-5.8 6-10V5.5Z" />
        <path d="M12 8v4" />
        <path d="M12 15h.01" />
      </>
    ),
    checkCircle: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12 2.3 2.3L15.5 9.5" />
      </>
    ),
    ban: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m8 8 8 8" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    mail: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    phone: (
      <>
        <path d="M7 4h3l1 4-2 1.5a14 14 0 0 0 5 5L15.5 13l4 1v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 6 8a2 2 0 0 1 1-4Z" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </>
    ),
    note: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 10v4" />
        <path d="M12 7.5h.01" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16" />
        <path d="M12 4a13 13 0 0 1 0 16" />
        <path d="M12 4a13 13 0 0 0 0 16" />
      </>
    ),
    moon: <path d="M18 13.5A6.5 6.5 0 1 1 10.5 6 5.5 5.5 0 0 0 18 13.5Z" />,
  }

  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

export default Icon
