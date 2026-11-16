import { comma_list } from "../helpers.js";

// Pipe query syntax: GoogleSQL (BigQuery, Spanner), Databricks and Spark 4.0.
// A query starts with SELECT, FROM or TABLE, then each `|>` operator takes the
// result so far as its input:
//
//   FROM orders
//   |> WHERE status = 'shipped'
//   |> AGGREGATE SUM(amount) AS total GROUP BY customer_id
//   |> ORDER BY total DESC;
export default {

  _pipe_query: $ => prec.right(choice(
    seq($._select_body, repeat1($.pipe_operator)),
    // A bare `FROM t` or `TABLE t` is already a complete query.
    seq(
      choice($.from, $._table_query),
      repeat($.pipe_operator),
    ),
  )),

  // Low precedence so that `ANALYZE TABLE t ...` keeps parsing as ANALYZE.
  _table_query: $ => prec(-1, seq(
    $.keyword_table,
    $.object_reference,
  )),

  pipe_operator: $ => seq(
    '|>',
    choice(
      $.select,
      $.where,
      $.order_by,
      $.limit,
      $.join,
      $.cross_join,
      $.pivot,
      $.unpivot,
      $._pipe_extend,
      $._pipe_set,
      $._pipe_drop,
      $._pipe_rename,
      $._pipe_as,
      $._pipe_aggregate,
      $._pipe_distinct,
      $._pipe_set_operation,
    ),
  ),

  // |> EXTEND price * qty AS revenue
  _pipe_extend: $ => seq(
    $.keyword_extend,
    $.select_expression,
  ),

  // |> SET price = price * 1.1
  _pipe_set: $ => seq(
    $.keyword_set,
    comma_list($.assignment, true),
  ),

  // |> DROP tmp, debug
  _pipe_drop: $ => seq(
    $.keyword_drop,
    comma_list(alias($._qualified_field, $.field), true),
  ),

  // |> RENAME a AS b
  _pipe_rename: $ => seq(
    $.keyword_rename,
    comma_list($.pipe_rename_item, true),
  ),

  pipe_rename_item: $ => seq(
    field('old', alias($._qualified_field, $.field)),
    optional($.keyword_as),
    field('new', $.identifier),
  ),

  // |> AS t
  _pipe_as: $ => seq(
    $.keyword_as,
    field('alias', $.identifier),
  ),

  // |> AGGREGATE COUNT(*) AS n GROUP BY region
  _pipe_aggregate: $ => prec.right(seq(
    $.keyword_aggregate,
    optional($.select_expression),
    optional($.group_by),
  )),

  // |> DISTINCT
  _pipe_distinct: $ => $.keyword_distinct,

  // |> UNION ALL (SELECT ...), (FROM ...)
  _pipe_set_operation: $ => seq(
    field(
      'operation',
      seq(
        choice(
          $.keyword_union,
          $.keyword_except,
          $.keyword_intersect,
        ),
        optional(
          choice(
            $.keyword_all,
            $.keyword_distinct,
          ),
        ),
      ),
    ),
    comma_list($.subquery, true),
  ),
};
