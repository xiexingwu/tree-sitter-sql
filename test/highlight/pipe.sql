FROM orders
-- <- keyword
     -- ^ type
|> WHERE status = 'shipped'
-- <- operator
   -- ^ keyword
|> EXTEND price * qty AS revenue
   -- ^ keyword
|> AGGREGATE SUM(revenue) AS total GROUP BY region
   -- ^ keyword
                                   -- ^ keyword
|> RENAME total AS sales
   -- ^ keyword
|> UNION ALL (TABLE archive)
   -- ^ keyword.operator
              -- ^ keyword
