import Link from "next/link";

type AppNavProps = {
  currentPath: "/" | "/pre-approval";
};

export function AppNav({ currentPath }: AppNavProps) {
  return (
    <nav className="app-nav" aria-label="Primary navigation">
      <Link
        href="/"
        className={`app-nav-link ${currentPath === "/" ? "is-active" : ""}`}
      >
        Historical dashboard
      </Link>
      <Link
        href="/pre-approval"
        className={`app-nav-link ${currentPath === "/pre-approval" ? "is-active" : ""}`}
      >
        Pre-Approval
      </Link>
    </nav>
  );
}
