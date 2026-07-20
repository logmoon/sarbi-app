ALTER TYPE event_type ADD VALUE 'session_conflict';

UPDATE table_events SET type = 'session_conflict' WHERE type = 'check_needed';
