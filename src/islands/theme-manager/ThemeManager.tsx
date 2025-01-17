import {
  createSignal,
  createEffect,
  Show,
  type Component,
  type JSX,
} from "solid-js";
import "./theme-manager.css";

interface Props {
  ariaLabel: string;
  iconLight?: JSX.Element;
  iconDark?: JSX.Element;
}

const ThemeManager: Component<Props> = (props: Props) => {
  const mediaMatcher = window.matchMedia("(prefers-color-scheme: light)");
  const systemTheme = mediaMatcher.matches ? "light" : "dark";
  const [theme, setTheme] = createSignal<"dark" | "light">(
    (localStorage.getItem("theme") as "dark" | "light") || systemTheme,
  );

  createEffect(() => {
    const currentTheme = theme();
    document.documentElement.dataset.theme = currentTheme;
    document.documentElement.style.colorScheme = currentTheme;
    localStorage.setItem("theme", currentTheme);
  });

  const updateTheme = (): void => {
    setTheme(theme() === "dark" ? "light" : "dark");
  };

  return (
    <button
      class="theme-button"
      type="button"
      aria-label={props.ariaLabel}
      onClick={updateTheme}
    >
      <Show when={theme() === "dark"}>{props.iconDark}</Show>

      <Show when={theme() === "light"}>{props.iconLight}</Show>
    </button>
  );
};

export { ThemeManager };
