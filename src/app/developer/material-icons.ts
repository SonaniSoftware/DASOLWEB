/**
 * A broad set of Material Icons (filled) names for the icon picker.
 * These all exist in the "Material Icons" font already loaded in index.html.
 * Add/remove freely — the picker also lets you type any custom icon name.
 */
export const MATERIAL_ICONS: string[] = [
  // Navigation / layout
  'dashboard', 'dashboard_customize', 'home', 'apps', 'widgets', 'grid_view', 'view_module',
  'view_list', 'view_comfy', 'view_quilt', 'table_view', 'table_chart', 'table_rows', 'view_column',
  'menu', 'menu_open', 'more_horiz', 'more_vert', 'expand_more', 'expand_less', 'chevron_right',
  'chevron_left', 'arrow_forward', 'arrow_back', 'arrow_upward', 'arrow_downward', 'open_in_new',
  'launch', 'fullscreen', 'splitscreen', 'space_dashboard', 'web', 'web_asset', 'tab', 'toc',

  // People / org
  'person', 'person_add', 'person_outline', 'people', 'people_alt', 'group', 'group_add', 'groups',
  'groups_2', 'groups_3', 'badge', 'supervisor_account', 'manage_accounts', 'account_circle',
  'account_box', 'how_to_reg', 'switch_account', 'family_restroom', 'diversity_3', 'engineering',
  'fingerprint', 'face', 'support_agent', 'contacts', 'contact_page', 'recent_actors',

  // Business / company
  'business', 'business_center', 'apartment', 'corporate_fare', 'domain', 'store', 'storefront',
  'factory', 'warehouse', 'home_work', 'foundation', 'real_estate_agent', 'meeting_room', 'work',
  'work_outline', 'cases', 'cases_outlined',

  // Inventory / products
  'inventory', 'inventory_2', 'category', 'sell', 'label', 'label_important', 'local_offer', 'tag',
  'qr_code', 'qr_code_2', 'qr_code_scanner', 'barcode_reader', 'shelves', 'pallet', 'shopping_cart',
  'shopping_cart_checkout', 'add_shopping_cart', 'remove_shopping_cart', 'shopping_bag', 'shopping_basket',
  'production_quantity_limits', 'precision_manufacturing', 'conveyor_belt', 'forklift',

  // Logistics
  'local_shipping', 'local_shipping', 'delivery_dining', 'two_wheeler', 'fire_truck', 'flight',
  'flight_takeoff', 'flight_land', 'directions_boat', 'train', 'directions_bus', 'route', 'map',
  'location_on', 'place', 'near_me', 'explore', 'public', 'language', 'travel_explore',

  // Sales / finance
  'point_of_sale', 'receipt', 'receipt_long', 'request_quote', 'price_check', 'price_change',
  'payments', 'payment', 'paid', 'savings', 'account_balance', 'account_balance_wallet',
  'credit_card', 'credit_score', 'attach_money', 'money', 'money_off', 'currency_rupee',
  'currency_exchange', 'percent', 'calculate', 'discount', 'redeem', 'card_giftcard', 'loyalty',
  'wallet', 'savings', 'request_page', 'monetization_on', 'euro', 'currency_pound',

  // Reports / analytics
  'assessment', 'analytics', 'bar_chart', 'stacked_bar_chart', 'pie_chart', 'donut_large',
  'donut_small', 'show_chart', 'stacked_line_chart', 'trending_up', 'trending_down', 'trending_flat',
  'insights', 'query_stats', 'leaderboard', 'monitoring', 'data_usage', 'summarize', 'timeline',
  'candlestick_chart', 'bubble_chart', 'scatter_plot', 'multiline_chart', 'area_chart',

  // Documents / files
  'description', 'article', 'assignment', 'assignment_ind', 'assignment_turned_in', 'assignment_late',
  'task', 'task_alt', 'fact_check', 'rule', 'checklist', 'checklist_rtl', 'list', 'list_alt',
  'playlist_add_check', 'note', 'note_add', 'sticky_note_2', 'edit_note', 'post_add', 'draft',
  'folder', 'folder_open', 'folder_shared', 'create_new_folder', 'topic', 'snippet_folder',
  'attach_file', 'file_copy', 'file_present', 'upload_file', 'picture_as_pdf', 'text_snippet',
  'document_scanner', 'find_in_page', 'plagiarism', 'menu_book', 'auto_stories', 'book', 'import_contacts',

  // Actions
  'add', 'add_circle', 'add_box', 'remove', 'remove_circle', 'close', 'check', 'check_circle', 'done',
  'done_all', 'edit', 'edit_square', 'delete', 'delete_forever', 'save', 'save_as', 'content_copy',
  'content_cut', 'content_paste', 'send', 'reply', 'forward', 'refresh', 'sync', 'autorenew', 'cached',
  'undo', 'redo', 'search', 'filter_list', 'filter_alt', 'sort', 'swap_vert', 'swap_horiz', 'tune',
  'settings_suggest', 'build', 'construction', 'handyman', 'home_repair_service', 'cleaning_services',

  // Settings / admin / security
  'settings', 'settings_applications', 'settings_suggest', 'admin_panel_settings', 'manage_history',
  'room_preferences', 'display_settings', 'security', 'shield', 'gpp_good', 'verified_user', 'policy',
  'lock', 'lock_open', 'lock_reset', 'key', 'vpn_key', 'password', 'pin', 'enhanced_encryption',
  'no_encryption', 'verified', 'gavel', 'balance', 'workspace_premium', 'military_tech',

  // Communication
  'email', 'mail', 'mark_email_read', 'mark_email_unread', 'drafts', 'outgoing_mail', 'inbox',
  'forward_to_inbox', 'call', 'phone', 'phone_in_talk', 'dialpad', 'voicemail', 'contact_phone',
  'contact_mail', 'chat', 'chat_bubble', 'forum', 'sms', 'message', 'comment', 'feedback',
  'notifications', 'notifications_active', 'notifications_none', 'campaign', 'announcement',

  // Time / calendar
  'calendar_today', 'calendar_month', 'date_range', 'event', 'event_available', 'event_busy',
  'event_note', 'today', 'schedule', 'access_time', 'timer', 'history', 'history_toggle_off',
  'hourglass_empty', 'hourglass_full', 'update', 'pending', 'pending_actions', 'alarm', 'watch_later',

  // Status / info
  'info', 'help', 'help_outline', 'warning', 'error', 'error_outline', 'report', 'report_problem',
  'priority_high', 'new_releases', 'verified', 'thumb_up', 'thumb_down', 'star', 'star_border',
  'grade', 'bookmark', 'bookmark_border', 'flag', 'visibility', 'visibility_off', 'lightbulb',

  // Developer / data / system
  'code', 'code_off', 'terminal', 'developer_mode', 'developer_board', 'bug_report', 'data_object',
  'data_array', 'dataset', 'schema', 'account_tree', 'hub', 'lan', 'dns', 'storage', 'database',
  'memory', 'router', 'cloud', 'cloud_done', 'cloud_upload', 'cloud_download', 'cloud_sync',
  'backup', 'restore', 'sync_alt', 'integration_instructions', 'api', 'webhook', 'extension',
  'settings_ethernet', 'device_hub', 'view_in_ar', 'token', 'key_visualizer',

  // HR / payroll / time
  'badge', 'work_history', 'punch_clock', 'schedule', 'event_seat', 'coffee', 'lunch_dining',
  'flight_class', 'health_and_safety', 'medical_services', 'vaccines', 'sick', 'elderly',
  'pregnant_woman', 'school', 'cast_for_education', 'workspace_premium', 'emoji_events', 'card_membership',

  // Misc
  'print', 'download', 'upload', 'share', 'link', 'attachment', 'history_edu', 'translate',
  'palette', 'format_paint', 'brush', 'image', 'photo', 'collections', 'camera_alt', 'qr_code_scanner',
  'location_city', 'maps_home_work', 'apartment', 'cottage', 'villa', 'cabin', 'gite', 'house',
  'settings_input_component', 'toggle_on', 'toggle_off', 'power', 'power_settings_new', 'bolt',
  'flash_on', 'auto_awesome', 'auto_fix_high', 'magic_button', 'science', 'biotech', 'experiment',
];

/** De-duplicated set (some categories overlap). */
export const MATERIAL_ICON_NAMES: string[] = [...new Set(MATERIAL_ICONS)];
