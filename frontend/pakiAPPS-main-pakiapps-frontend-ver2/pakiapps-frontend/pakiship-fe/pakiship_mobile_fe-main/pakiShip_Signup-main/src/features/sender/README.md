This folder represents the sender persona on the frontend.

Current mapping:
- `SenderHomeScreen.tsx` is the sender-facing home screen entry.
- It currently reuses the existing `customer` home implementation so the app output stays unchanged.
- The active navigator now imports the sender home from this folder.

This keeps sender-specific frontend code easy to find while preserving the original behavior during the planned app merge.
