-- ============================================================================
-- Persist cancellation acknowledgment on orders
-- ============================================================================
-- The floor feed's "acknowledge" action for a cancelled order was only
-- ever tracked in client-side React state (a Set of dismissed order ids).
-- That meant: a refresh forgot it (the order came right back), and it
-- never propagated between screens (the owner acknowledging it on their
-- own screen did nothing for the dedicated floor staff's screen, and vice
-- versa). Acknowledgment needs to be a real, shared fact about the order.
-- ============================================================================

ALTER TABLE orders
  ADD COLUMN cancelled_acknowledged_at TIMESTAMPTZ;
