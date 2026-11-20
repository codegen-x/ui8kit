// The simple line, wave 2 (content and page frame; one content model each, specs/models): FeatureShowcaseSimple (feature-showcase@1),
// HeaderSimple (header@1), FooterSimple (footer@1), EventIntro (event@1), ProfileIntro (profile@1), RatingSimple (rating@1),
// ErrorSimple (error@1), FigureSimple (figure@1), PullQuoteSimple (pull-quote@1), ArticleSimple (article@1), ArticleLead
// (article-lead@1), TopicsSimple (topics@1), ChaptersSimple (chapters@1). The rules of simple.ts and simple-more.ts: the props are the
// fields of the model plus the axes and the settings; only the layout compositions packages/prototypes lowers and the places.
import { and, cn, each, not, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value } from "../../ir";
import { fields, spec } from "../kit";
import { id, title, tsOf } from "../props";
import { O, level, description, titleId, padding, align, alignDerived, teamDerived, alignItems, textAlign, itemsAlign, section, lead, action, paddingClass } from "./simple";
import { badge, centered, list, heading, head, itemTitle, itemText, ulist, is, isAlignV, chain, avatar } from "./simple-more";
import { wide } from "../components/frames";

const str = (name: string, docs: string, required = false) => (required ? { name, type: "string" as const, required: true, docs } : { name, type: "string" as const, default: "", docs });
const actionPair = [str("actionLabel", "the label of the action; the link is drawn when the label and the address are both set"), str("actionHref", "the address of the action")];
const image = str("image", "address of the picture; none: the placeholder");
const imageAlt = str("imageAlt", "alt text of the picture", true);
const media = (...values: string[]) => ({ name: "media", type: tsOf(...values), default: values[0] });
const layout = (...values: string[]) => ({ name: "layout", type: tsOf(...values), default: values[0] });
const cols = (...values: string[]) => ({ name: "cols", type: tsOf(...values), default: values[values.length - 1] });
const picture = (ratio: Value, className: Value = "") => organism("MediaFrame", { alt: ref("imageAlt"), src: ref("image"), ratio, className });
const muted = (field: string, size = "sm", cls: Value = textAlign) => use("Text", { props: { Size: size, Class: cn("text-muted-foreground", cls) } }, text(ref(field)));
const linkTo = (href: string, body: ReturnType<typeof use>) =>
  when(ref(href), [use("LinkPlain", { props: { Href: ref(href), Class: "hover:text-primary" } }, body)], [body]);
const frame = (name: string) => chain(name, [[is("media", "top"), "grid grid-cols-1 gap-12"]], "grid grid-cols-1 items-center gap-12 md:grid-cols-2");
const first = (name: string, cls = "") => chain(name, [[is("media", "start"), `order-first ${cls}`.trim()], [is("media", "top"), `order-first ${cls}`.trim()]], cls);

// ---- FeatureShowcaseSimple (feature-showcase@1): the head and the key points beside one picture (end, start) or under it (top)
const top = is("media", "top");
const featureShowcase = spec(`${O}feature-showcase-simple`, "FeatureShowcaseSimple", "The simple feature showcase (model feature-showcase@1): the heading, a description, one picture and the key points as a list (a title, a line). Axes: media (end: the picture after the copy, start: before it from md up, top: the head over a wide picture, the points in three columns under it).", {
  records: { ShowcaseItem: fields(["id", "string"], ["title", "string"], ["description", "string", true]) },
  props: [id, title, description, image, imageAlt, list("items", "ShowcaseItem", "the key points, in the order they are shown (1 to 6)"), level, padding, align, media("end", "start", "top")],
  derived: [titleId, ...teamDerived, frame("frame"), first("pictureClass"), chain("ratio", [[top, "21/9"]], "4/3"), chain("grid", [[top, "sm:grid-cols-2 md:grid-cols-3"]], "sm:grid-cols-2")],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      when(top, [head()]),
      use("Box", { props: { Class: ref("frame") } },
        use("Stack", { props: { Gap: "8", Align: "stretch" } },
          when(not(top), [head()]),
          ulist(cn("grid grid-cols-1 gap-6", ref("grid")),
            each(ref("items"), "f", ref("f.id"),
              use("ListItem", { props: { Class: cn("flex flex-col gap-2", itemsAlign) }, attrs: { "data-testid": "point" } }, itemTitle("f.title", "base"), itemText("f.description"))))),
        picture(ref("ratio"), ref("pictureClass")))))],
});

// ---- HeaderSimple (header@1): the brand, the navigation links and one action in a bar; inline, the links at the end, or centred
const headerSimple = spec(`${O}header-simple`, "HeaderSimple", "The simple header (model header@1): the brand as the link home, the navigation links as a list in a nav and one action. No menu button: the links wrap under the brand on a narrow screen. Axes: layout (inline: the links in the middle, end: the links beside the action, centered: the brand over the links).", {
  records: { HeaderLink: fields(["id", "string"], ["label", "string"], ["href", "string"]) },
  props: [id, str("brand", "the name of the site (the link home)", true), str("brandHref", "the address of the home page", true), list("links", "HeaderLink", "the navigation links, in the order they are shown (1 to 6)"), ...actionPair, layout("inline", "end", "centered")],
  derived: [
    chain("frame", [[is("layout", "centered"), "flex flex-col items-center gap-4"]], "flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"),
    chain("bar", [[is("layout", "inline"), "md:grow md:justify-between"], [is("layout", "centered"), "justify-center"]], "md:justify-end"),
    chain("nav", [[is("layout", "inline"), "md:grow"]], ""),
    chain("linkRow", [[is("layout", "inline"), "md:justify-center"], [is("layout", "centered"), "justify-center"]], ""),
  ],
  view: [use("Block", { props: { Tag: "header", Class: "py-4" } },
    use("Container", { props: { Class: wide } },
      use("Box", { props: { Class: ref("frame") } },
        use("LinkPlain", { props: { Href: ref("brandHref"), Class: "text-foreground hover:text-primary" } }, use("Text", { props: { Size: "xl", Weight: "bold" } }, text(ref("brand")))),
        use("Group", { props: { Gap: "6", Align: "center", Class: cn("flex-wrap", ref("bar")) } },
          use("Box", { props: { Class: ref("nav") } },
            ulist(cn("flex flex-wrap gap-6", ref("linkRow")),
              each(ref("links"), "l", ref("l.id"),
                use("ListItem", { attrs: { "data-testid": "nav-link" } },
                  use("LinkPlain", { props: { Href: ref("l.href"), Class: "text-muted-foreground hover:text-foreground" } }, use("Text", { props: { Size: "sm" } }, text(ref("l.label")))))))),
          action("actionLabel", "actionHref", "default")))))],
});

// ---- FooterSimple (footer@1): the brand and its line beside the links (a row or a grid), or centred; the copyright under them
const footerSimple = spec(`${O}footer-simple`, "FooterSimple", "The simple footer (model footer@1): the brand, one line about the site, the links as a list in a nav and the copyright line. Axes: layout (row: the brand beside a row of links, grid: the brand beside the links in two or three columns, centered: everything centred).", {
  records: { FooterLink: fields(["id", "string"], ["label", "string"], ["href", "string"]) },
  props: [id, str("brand", "the name of the site", true), description, list("links", "FooterLink", "the links, in the order they are shown (1 to 12)"), str("copyright", "the copyright line", true), { ...padding, default: "compact" }, layout("row", "grid", "centered")],
  derived: [
    chain("frame", [[is("layout", "centered"), "flex flex-col items-center gap-8 text-center"], [is("layout", "grid"), "grid grid-cols-1 gap-8 md:grid-cols-2"]], "flex flex-col gap-8 md:flex-row md:items-start md:justify-between"),
    chain("linkRow", [[is("layout", "grid"), "grid grid-cols-2 gap-4 sm:grid-cols-3"], [is("layout", "centered"), "flex flex-wrap justify-center gap-6"]], "flex flex-wrap gap-6"),
    chain("copyAlign", [[is("layout", "centered"), "center"]], "start"),
    chain("copyText", [[is("layout", "centered"), "text-center"]], "text-start"),
  ],
  view: [use("Block", { props: { Tag: "footer", Class: paddingClass } },
    use("Container", { props: { Class: wide } },
      use("Stack", { props: { Gap: "8", Align: "stretch" } },
        use("Box", { props: { Class: ref("frame") } },
          use("Stack", { props: { Gap: "2", Align: ref("copyAlign"), Class: "max-w-sm" } },
            use("Text", { props: { Size: "lg", Weight: "bold", Class: ref("copyText") } }, text(ref("brand"))),
            itemText("description", ref("copyText"))),
          use("Box", {},
            ulist(ref("linkRow"),
              each(ref("links"), "l", ref("l.id"),
                use("ListItem", { attrs: { "data-testid": "footer-link" } },
                  use("LinkPlain", { props: { Href: ref("l.href"), Class: "text-muted-foreground hover:text-foreground" } }, use("Text", { props: { Size: "sm" } }, text(ref("l.label"))))))))),
        muted("copyright", "xs", ref("copyText")))))],
});

// ---- EventIntro (event@1): the first screen of an event: a badge, the name, a line, the date and the place, one action
const eventIntro = spec(`${O}event-intro`, "EventIntro", "The event intro (model event@1): an optional badge, the name of the event as a large heading, a description, the date and the place as a list of two facts, and one action. Text only. The align setting places it: centred or at the start.", {
  props: [id, badge, title, description, str("date", "the date and the time as they are shown", true), str("place", "the place or the city, or online", true), ...actionPair, level, padding, centered],
  derived: [titleId, ...teamDerived, chain("facts", [[isAlignV("center"), "justify-center"], [isAlignV("end"), "justify-end"]], "justify-start")],
  view: [section(
    use("Stack", { props: { Gap: "6", Align: alignItems } },
      when(ref("badge"), [use("Badge", { props: { Variant: "secondary" } }, text(ref("badge")))]),
      use("Title", { props: { As: ref("level"), Size: "5xl", Weight: "bold", Class: cn("max-w-4xl tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
      when(ref("description"), [use("Text", { props: { Size: "lg", Class: cn("max-w-2xl text-muted-foreground", textAlign) } }, text(ref("description")))]),
      ulist(cn("flex flex-wrap gap-x-8 gap-y-2", ref("facts")),
        use("ListItem", { attrs: { "data-testid": "event-date" } }, use("Text", { props: { Size: "base", Weight: "semibold" } }, text(ref("date")))),
        use("ListItem", { attrs: { "data-testid": "event-place" } }, use("Text", { props: { Size: "base", Weight: "semibold" } }, text(ref("place"))))),
      action("actionLabel", "actionHref", "default")))],
});

// ---- ProfileIntro (profile@1): a person: the name, the role, a line and the links beside the portrait, or under a disc
const profileIntro = spec(`${O}profile-intro`, "ProfileIntro", "The profile intro (model profile@1): the name as the heading, the role (the primary token), a description, the links of the person as a list of small outline links, and the portrait. Axes: media (end: the portrait after the copy, start: before it from md up, top: a disc over the copy).", {
  records: { ProfileLink: fields(["id", "string"], ["label", "string"], ["href", "string"]) },
  props: [id, { ...title, docs: "the name of the person (the heading)" }, str("role", "the role and the company", true), description, image, imageAlt, list("links", "ProfileLink", "the links of the person, in the order they are shown (0 to 4)"), level, padding, align, media("end", "start", "top")],
  derived: [
    titleId, ...teamDerived,
    chain("frame", [[top, "flex flex-col items-center gap-8"]], "grid grid-cols-1 items-center gap-12 md:grid-cols-2"),
    chain("pictureCell", [[top, "order-first w-full"], [is("media", "start"), "order-first w-full"]], "w-full"),
    chain("pictureClass", [[top, "mx-auto size-32 rounded-full"]], "mx-auto w-full max-w-sm"),
    chain("linkRow", [[isAlignV("center"), "justify-center"], [isAlignV("end"), "justify-end"]], "justify-start"),
  ],
  view: [section(
    use("Box", { props: { Class: ref("frame") } },
      use("Stack", { props: { Gap: "4", Align: alignItems } },
        heading("4xl"),
        use("Text", { props: { Size: "lg", Weight: "medium", Class: cn("text-primary", textAlign) } }, text(ref("role"))),
        lead("base"),
        ulist(cn("flex flex-wrap gap-2", ref("linkRow")),
          each(ref("links"), "l", ref("l.id"),
            use("ListItem", { attrs: { "data-testid": "profile-link" } },
              use("LinkButton", { props: { Variant: "outline", Size: "sm", Href: ref("l.href") } }, text(ref("l.label"))))))),
      // the picture in a cell of its own: the narrow portrait centres in its column (the copy beside it starts with the heading)
      use("Box", { props: { Class: ref("pictureCell") } }, picture("1/1", ref("pictureClass")))))],
});

// ---- RatingSimple (rating@1): the score, what it is and the source: a bar on a card surface, or centred
const ratingSimple = spec(`${O}rating-simple`, "RatingSimple", "The simple rating (model rating@1): the score (large), the heading that names it, a line (the count, the scale) and the source as a link. Axes: layout (bar: one row on a card surface from md up, centered: centred, one under the other).", {
  props: [id, str("value", "the score as it is shown (4.9, 98%)", true), title, str("description", "the count and the scale; empty: none"), str("sourceLabel", "the label of the source; the link is drawn when the label and the address are both set"), str("sourceHref", "the address of the source"), level, padding, layout("bar", "centered")],
  derived: [
    titleId,
    chain("box", [[is("layout", "bar"), "flex flex-col gap-4 rounded bg-card p-6 text-card-foreground border border-border md:flex-row md:items-center md:gap-8"]], "flex flex-col items-center gap-4 text-center"),
    chain("copy", [[is("layout", "bar"), "md:grow"]], ""),
    chain("copyAlign", [[is("layout", "bar"), "start"]], "center"),
    chain("copyText", [[is("layout", "bar"), "text-start"]], "text-center"),
  ],
  view: [section(
    use("Box", { props: { Class: ref("box") } },
      use("Text", { props: { Size: "5xl", Weight: "bold", Class: "tracking-tight text-primary" } }, text(ref("value"))),
      use("Stack", { props: { Gap: "2", Align: ref("copyAlign"), Class: ref("copy") } },
        use("Title", { props: { As: ref("level"), Size: "xl", Weight: "semibold", Class: ref("copyText") }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        itemText("description", ref("copyText"))),
      when(and(ref("sourceLabel"), ref("sourceHref")), [use("LinkPlain", { props: { Href: ref("sourceHref"), Class: "text-muted-foreground hover:text-foreground" } }, use("Text", { props: { Size: "sm" } }, text(ref("sourceLabel"))))])))],
});

// ---- ErrorSimple (error@1): the code, the heading, a line and one action back; centred or at the start
const errorSimple = spec(`${O}error-simple`, "ErrorSimple", "The simple error (model error@1): the code (large, the primary token), the heading, a description and one action back. Text only. The align setting places it: centred or at the start.", {
  props: [id, str("code", "the code as it is shown (404)", true), title, description, ...actionPair, level, padding, centered],
  derived: [titleId, ...alignDerived],
  view: [section(
    use("Stack", { props: { Gap: "6", Align: alignItems, Justify: "center", Class: "min-h-96" } },
      use("Text", { props: { Size: "5xl", Weight: "bold", Class: cn("tracking-tight text-primary", textAlign) } }, text(ref("code"))),
      heading("4xl"),
      when(ref("description"), [use("Text", { props: { Size: "lg", Class: cn("max-w-2xl text-muted-foreground", textAlign) } }, text(ref("description")))]),
      action("actionLabel", "actionHref", "default")))],
});

// ---- FigureSimple (figure@1): one large picture and its caption (a figure): under it, wide, or at the side from md up
const figureSimple = spec(`${O}figure-simple`, "FigureSimple", "The simple figure (model figure@1): one large picture with its caption in a figure: the title (it names the section), a line and the credit. Axes: layout (wide: the caption centred under the picture, end: the caption beside it at the end from md up, start: at the start).", {
  props: [id, image, imageAlt, { ...title, docs: "the title of the caption (names the section)" }, description, str("credit", "the credit of the picture; empty: none"), padding, layout("wide", "end", "start")],
  derived: [
    titleId,
    chain("frame", [[is("layout", "wide"), "flex flex-col gap-6"]], "grid grid-cols-1 gap-6 md:grid-cols-3 md:items-end"),
    chain("pictureClass", [[is("layout", "wide"), ""]], "md:col-span-2"),
    chain("ratio", [[is("layout", "wide"), "16/9"]], "4/3"),
    chain("caption", [[is("layout", "wide"), "mx-auto max-w-2xl"], [is("layout", "start"), "md:order-first"]], ""),
    chain("copyAlign", [[is("layout", "wide"), "center"]], "start"),
    chain("copyText", [[is("layout", "wide"), "text-center"]], "text-start"),
  ],
  view: [section(
    use("Box", { props: { Tag: "figure", Class: ref("frame") } },
      picture(ref("ratio"), ref("pictureClass")),
      use("Stack", { props: { Gap: "2", Align: ref("copyAlign"), Class: ref("caption") } },
        use("Text", { props: { Size: "base", Weight: "semibold", Class: ref("copyText") }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        itemText("description", ref("copyText")),
        itemText("credit", ref("copyText"), "xs"))))],
});

// ---- PullQuoteSimple (pull-quote@1): the words in a blockquote with the author under them: a rule at the side, or centred
const pullQuote = spec(`${O}pull-quote-simple`, "PullQuoteSimple", "The simple pull quote (model pull-quote@1): the words in a blockquote, then the author (names the section), a role line and the source as a link, in a figure. Axes: layout (rule: a bar in the primary token at the start, centered: centred, no bar).", {
  props: [id, str("quote", "the words that are quoted", true), { ...title, docs: "the name of the author (names the section)" }, str("description", "the role of the author; empty: none"), str("sourceLabel", "the label of the source; the link is drawn when the label and the address are both set"), str("sourceHref", "the address of the source"), padding, layout("rule", "centered")],
  derived: [
    titleId,
    chain("frame", [[is("layout", "rule"), "flex flex-row gap-6"]], "flex flex-col items-center"),
    chain("copyAlign", [[is("layout", "rule"), "start"]], "center"),
    chain("copyText", [[is("layout", "rule"), "text-start"]], "text-center"),
  ],
  view: [section(
    use("Box", { props: { Tag: "figure", Class: cn("mx-auto max-w-3xl", ref("frame")) } },
      when(is("layout", "rule"), [use("Box", { props: { Class: "w-2 shrink-0 self-stretch rounded-full bg-primary" }, attrs: { "aria-hidden": "true" } })]),
      use("Stack", { props: { Gap: "6", Align: ref("copyAlign") } },
        use("Text", { props: { Tag: "blockquote", Size: "2xl", Weight: "medium", Class: cn("tracking-tight", ref("copyText")) } }, text(ref("quote"))),
        use("Stack", { props: { Gap: "2", Align: ref("copyAlign") } },
          use("Text", { props: { Size: "base", Weight: "semibold", Class: ref("copyText") }, attrs: { id: ref("titleId") } }, text(ref("title"))),
          itemText("description", ref("copyText")),
          when(and(ref("sourceLabel"), ref("sourceHref")), [use("LinkPlain", { props: { Href: ref("sourceHref"), Class: "text-primary hover:text-foreground" } }, use("Text", { props: { Size: "sm" } }, text(ref("sourceLabel"))))])))))],
});

// ---- ArticleSimple (article@1): the heading and the sections of a text: one reading column, or two columns under a centred head
const articleSimple = spec(`${O}article-simple`, "ArticleSimple", "The simple article (model article@1): the heading, a description and the sections of the text as a list, each a subheading and its paragraph. Axes: layout (column: one reading column, max-w-3xl, columns: two columns under the head from md up).", {
  records: { ArticleSection: fields(["id", "string"], ["title", "string"], ["description", "string"]) },
  props: [id, title, description, list("sections", "ArticleSection", "the sections, in the order they are read (1 to 8)"), level, padding, align, layout("column", "columns")],
  derived: [titleId, ...teamDerived, chain("narrow", [[is("layout", "column"), "mx-auto max-w-3xl"]], ""), chain("grid", [[is("layout", "columns"), "md:grid-cols-2"]], "")],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch", Class: ref("narrow") } },
      head(),
      ulist(cn("grid grid-cols-1 gap-8", ref("grid")),
        each(ref("sections"), "s", ref("s.id"),
          use("ListItem", { props: { Class: "flex flex-col items-start gap-4" }, attrs: { "data-testid": "article-section" } },
            itemTitle("s.title", "xl", "text-start"),
            use("Text", { props: { Size: "base", Class: "text-start leading-relaxed" } }, text(ref("s.description"))))))))],
});

// ---- ArticleLead (article-lead@1): the heading, the lead and the byline beside the cover (end, start) or under it (top)
const articleLead = spec(`${O}article-lead`, "ArticleLead", "The article lead (model article-lead@1): the heading, the lead paragraph, the byline (the portrait, the author, the date) and the cover picture. Axes: media (top: the cover over the copy, wide, start: the cover before the copy from md up, end: after it).", {
  props: [id, title, description, image, imageAlt, str("author", "the name of the author", true), str("avatar", "address of the portrait of the author; none: the placeholder"), str("date", "the date as it is shown", true), level, padding, align, media("top", "start", "end")],
  derived: [titleId, ...alignDerived, frame("frame"), first("pictureClass"), chain("ratio", [[top, "21/9"]], "4/3")],
  view: [section(
    use("Box", { props: { Class: ref("frame") } },
      use("Stack", { props: { Gap: "6", Align: alignItems } },
        heading("4xl"),
        lead("lg"),
        use("Group", { props: { Gap: "4", Align: "center" } },
          avatar("author", "avatar", "size-10"),
          use("Stack", { props: { Gap: "0", Align: "start" } },
            use("Text", { props: { Size: "sm", Weight: "semibold" } }, text(ref("author"))),
            muted("date", "sm", "")))),
      picture(ref("ratio"), ref("pictureClass"))))],
});

// ---- TopicsSimple (topics@1): blog rubrics as cards in columns, or rows
const topicsSimple = spec(`${O}topics-simple`, "TopicsSimple", "The simple topics (model topics@1): the heading, a description and the topics as a list on a card surface, each with a short label (a badge), the title (a link when the topic has an address) and a line. Axes: layout (cards: columns, rows: one under the other), cols (2, 3 columns of the cards).", {
  records: { TopicItem: fields(["id", "string"], ["label", "string"], ["title", "string"], ["description", "string", true], ["href", "string", true]) },
  props: [id, title, description, list("items", "TopicItem", "the topics, in the order they are shown (1 to 8)"), level, padding, centered, layout("cards", "rows"), cols("2", "3")],
  derived: [titleId, ...teamDerived, chain("grid", [[is("layout", "rows"), "mx-auto w-full max-w-3xl"], [is("cols", "2"), "md:grid-cols-2"]], "md:grid-cols-3"), chain("item", [[is("layout", "rows"), "md:flex-row md:items-center md:gap-6"]], "")],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      head(),
      ulist(cn("grid grid-cols-1 gap-6", ref("grid")),
        each(ref("items"), "t", ref("t.id"),
          use("ListItem", { props: { Class: cn("flex flex-col items-start gap-4 rounded bg-card p-6 text-card-foreground border border-border", ref("item")) }, attrs: { "data-testid": "topic" } },
            use("Badge", { props: { Variant: "secondary" } }, text(ref("t.label"))),
            use("Stack", { props: { Gap: "2", Align: "start" } },
              linkTo("t.href", itemTitle("t.title", "lg", "text-start")),
              itemText("t.description", "text-start")))))))],
});

// ---- ChaptersSimple (chapters@1): chapters as rows with the picture at the side, or as a pair with the picture under the copy
const chaptersSimple = spec(`${O}chapters-simple`, "ChaptersSimple", "The simple chapters (model chapters@1): the heading, a description and the chapters as a list, each with a picture, a short label (a badge), the title and a paragraph. Axes: layout (rows: the picture at the start of each row, a third of it, paired: two columns, the picture under the copy).", {
  records: { ChapterItem: fields(["id", "string"], ["image", "string", true], ["label", "string"], ["title", "string"], ["description", "string", true]) },
  props: [id, title, description, list("items", "ChapterItem", "the chapters, in the order they are read (1 to 6)"), level, padding, centered, layout("rows", "paired")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "paired"), "gap-8 md:grid-cols-2"]], "gap-8"),
    chain("item", [[is("layout", "paired"), "flex flex-col gap-6"]], "flex flex-col gap-6 sm:flex-row sm:items-start"),
    chain("pictureClass", [[is("layout", "paired"), "order-last"]], "sm:w-1/3 sm:shrink-0"),
    chain("ratio", [[is("layout", "paired"), "16/9"]], "4/3"),
  ],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      head(),
      ulist(cn("grid grid-cols-1", ref("grid")),
        each(ref("items"), "c", ref("c.id"),
          use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "chapter" } },
            organism("MediaFrame", { alt: ref("c.title"), src: ref("c.image"), ratio: ref("ratio"), className: ref("pictureClass") }),
            use("Stack", { props: { Gap: "2", Align: "start" } },
              use("Badge", { props: { Variant: "secondary" } }, text(ref("c.label"))),
              itemTitle("c.title", "lg", "text-start"),
              itemText("c.description", "text-start", "base")))))))],
});

export const simpleContentOrganisms: OrganismSpec[] = [
  featureShowcase, headerSimple, footerSimple, eventIntro, profileIntro, ratingSimple, errorSimple, figureSimple, pullQuote, articleSimple, articleLead, topicsSimple, chaptersSimple,
];
