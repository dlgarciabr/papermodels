import { WIDGET } from "./widget";
import { LANDMARK } from "./landmark";
import { STRUCTURE } from "./structure";

/**
 * Extracted from [a11y-types](https://github.com/natemoo-re/a11y-types),
 * all credits to [Nate Moore](https://github.com/natemoo-re)
 */
export const ARIA_ROLE = {
  /**
   * Widget roles act as standalone user interface widgets or as part of larger, composite widgets.
   */
  WIDGET,

  /**
   * Landmark Roles indicate regions of the page intended as navigational landmarks.
   */
  LANDMARK,
  /**
   * Structure roles describe structures that organize content in a page.
   *
   * Document structures are not usually interactive.
   */
  STRUCTURE,
};
