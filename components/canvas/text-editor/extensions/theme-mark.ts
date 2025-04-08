import { Mark, mergeAttributes } from "@tiptap/core";

export interface ThemeMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    themeMark: {
      setThemeMark: (attributes: {
        themeId: string;
        color: string;
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
    };
  },

  addAttributes() {
    return {
      themeId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-theme-id"),
        renderHTML: (attributes) => {
          if (!attributes.themeId) {
            return {};
          }
          return {
            "data-theme-id": attributes.themeId,
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-theme-color"),
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            "data-theme-color": attributes.color,
            style: `border-bottom: 2px solid ${attributes.color}`,
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
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetThemeMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
