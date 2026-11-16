import { comma_list } from "../helpers.js";

export default {

  // Right associative so that inside BEGIN ... END, where statements need no
  // separator, `TRUNCATE TABLE t` is not read as `TRUNCATE` then `TABLE t`.
  _truncate_statement: $ => prec.right(seq(
    $.keyword_truncate,
    optional($.keyword_table),
    optional($.keyword_only),
    comma_list($.object_reference),
    optional($._drop_behavior),
  )),

};
