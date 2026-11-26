"""Legacy private-site imports are disabled after the public-only cutover."""
raise SystemExit(
    'ROMI now uses the public site as its operating release. '
    'Importing an old management-site ZIP could restore hidden/deleted images '
    'or overwrite placements. Use romi-maintenance/README.md in the maintenance '
    'workspace instead. No files were modified.'
)
