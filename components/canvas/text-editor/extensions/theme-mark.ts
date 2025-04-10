import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

export interface ThemeMarkOptions {
  HTMLAttributes: Record<string, any>;
  onThemeMarkClick?: (themeIds: string[], colors: string[]) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    themeMark: {
      setThemeMark: (attributes: {
        themeId: string | string[];
        color: string | string[];
      }) => ReturnType;
      unsetThemeMark: () => ReturnType;
    };
  }
}

export const ThemeMark = Mark.create<ThemeMarkOptions>({
  name: "themeMark",

  addOptions() {
    return {
      HTMLAttributes: {},
      onThemeMarkClick: undefined,
    };
  },

  addAttributes() {
    return {
      themeId: {
        default: null,
        parseHTML: (element) => {
          const themeIdAttr = element.getAttribute("data-theme-id");
          if (!themeIdAttr) return null;
          try {
            return JSON.parse(themeIdAttr);
          } catch {
            return themeIdAttr;
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.themeId) {
            return {};
          }
          const themeIds = Array.isArray(attributes.themeId)
            ? attributes.themeId
            : [attributes.themeId];
          return {
            "data-theme-id": JSON.stringify(themeIds),
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => {
          const colorAttr = element.getAttribute("data-theme-color");
          if (!colorAttr) return null;
          try {
            return JSON.parse(colorAttr);
          } catch {
            return colorAttr;
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }

          const colors = Array.isArray(attributes.color)
            ? attributes.color
            : [attributes.color];

          // If there's only one color, use a simple border
          if (colors.length === 1) {
            return {
              "data-theme-color": JSON.stringify(colors),
              style: `--theme-gradient: ${colors[0]};`,
              class: "theme-mark",
            };
          }

          // For multiple colors, create a gradient border
          const gradientStops = colors
            .map((color, index) => {
              const start = (index / colors.length) * 100;
              const end = ((index + 1) / colors.length) * 100;
              return `${color} ${start}% ${end}%`;
            })
            .join(", ");

          return {
            "data-theme-color": JSON.stringify(colors),
            style: `--theme-gradient: ${gradientStops};`,
            class: "theme-mark",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark[data-theme-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setThemeMark:
        (attributes) =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to);
          console.log(`Marked word: "${text}" at position ${from}-${to}`);
          return commands.setMark(this.name, attributes);
        },
      unsetThemeMark:
        () =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to);
          console.log(`Unmarked word: "${text}" at position ${from}-${to}`);
          return commands.unsetMark(this.name);
        },
    };
  },
});
