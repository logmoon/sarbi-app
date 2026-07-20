export type Locale = "ar" | "fr" | "en";

const SUPPORTED_LOCALES: readonly Locale[] = ["ar", "fr", "en"] as const;

type LabelMap = Record<Locale, Record<string, string>>;

const labels: LabelMap = {
  ar: {
    /** Common */
    "common.cancel": "إلغاء",
    "common.clear": "تفريغ",
    "common.save": "حفظ",
    "common.saving": "جاري الحفظ...",
    "common.delete": "حذف",
    "common.deleting": "جاري الحذف...",
    "common.loading": "جاري التحميل...",
    "common.retry": "إعادة المحاولة",
    "common.dismiss": "إغلاق",
    "common.close": "إغلاق",
    "common.edit": "تعديل",
    "common.remove": "إزالة",
    "common.add": "إضافة",
    "common.yes": "نعم",
    "common.no": "لا",
    "common.soon": "قريباً",
    "common.uploadImage": "تحميل صورة",
    "common.dragOrClick": "أو اسحب وأفلت",
    "common.replaceImage": "استبدال الصورة",
    "common.uploading": "جاري التحميل...",
    "common.uploadFailed": "فشل التحميل.",

    /** Auth */
    "auth.signIn": "تسجيل الدخول",
    "auth.signingIn": "جاري تسجيل الدخول...",
    "auth.email": "البريد الإلكتروني",
    "auth.emailPlaceholder": "vous@restaurant.tn",
    "auth.password": "كلمة المرور",
    "auth.passwordPlaceholder": "أدخل كلمة المرور",
    "auth.welcome": "مرحباً بعودتك",
    "auth.welcomeSub": "سجل الدخول لإدارة مطعمك.",
    "auth.setup.title": "إعداد حسابك",
    "auth.setup.welcome":
      "مرحباً {name} — أنشئ كلمة مرور لإكمال الإعداد.",
    "auth.setup.welcomeFallback":
      "أنشئ كلمة مرور لإكمال الإعداد.",
    "auth.setup.name": "الاسم",
    "auth.setup.confirmPassword": "تأكيد كلمة المرور",
    "auth.setup.confirmPasswordPlaceholder": "أعد كلمة المرور",
    "auth.setup.creatingAccount": "جاري الإعداد...",
    "auth.setup.createAccount": "إنشاء حساب",
    "auth.setup.validating": "جاري التحقق من الدعوة...",
    "auth.setup.invalidInvite": "دعوة غير صالحة أو منتهية الصلاحية",
    "auth.setup.invalidInviteDesc":
      "رابط الدعوة هذا غير صالح أو منتهي الصلاحية. اتصل بمسؤول المطعم للحصول على رابط جديد.",
    "auth.setup.passwordMin":
      "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    "auth.setup.passwordMismatch": "كلمات المرور غير متطابقة.",
    "auth.setup.somethingWrong": "حدث خطأ ما.",
    "auth.setup.passwordPlaceholder": "6 أحرف على الأقل",
    "auth.wordmark": "سربي",
    "auth.tagline": "قوائم رقمية وطلب على الطاولة",

    /** Navigation */
    "nav.menu": "القائمة",
    "nav.tables": "الطاولات",
    "nav.orders": "الطلبات",
    "nav.staff": "الموظفون",
    "nav.analytics": "الإحصائيات",
    "nav.settings": "الإعدادات",
    "nav.toggleMenu": "تبديل القائمة",
    "nav.staffScreens": "شاشات الموظفين",
    "nav.kds": "شاشة المطبخ",
    "nav.floor": "طاقم الصالة",

    /** Menu Editor */
    "menu.title": "القائمة",
    "menu.subtitle": "إدارة الفئات والعناصر",
    "menu.addCategory": "+ إضافة فئة",
    "menu.addItem": "+ إضافة عنصر",
    "menu.editCategory": "تعديل الفئة",
    "menu.addCategoryTitle": "إضافة فئة",
    "menu.editItem": "تعديل العنصر",
    "menu.addItemTitle": "إضافة عنصر",
    "menu.deleteCategory": "حذف الفئة",
    "menu.deleteCategoryConfirm":
      "هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع العناصر في هذه الفئة أيضاً.",
    "menu.deleteItem": "حذف العنصر",
    "menu.deleteItemConfirm": "هل أنت متأكد من حذف هذا العنصر؟",
    "menu.noCategories": "لا توجد فئات بعد",
    "menu.noCategoriesDesc": "أنشئ فئتك الأولى للبدء.",
    "menu.noItems":
      "لا توجد عناصر بعد. انقر على \"إضافة عنصر\" لإنشاء واحد.",
    "menu.loadingMenu": "جاري تحميل القائمة...",
    "menu.failedToLoad": "فشل تحميل القائمة",
    "menu.category": "الفئة",
    "menu.nameEnglish": "الاسم (بالإنجليزية)",
    "menu.nameFrench": "الاسم (بالفرنسية)",
    "menu.nameArabic": "الاسم (بالعربية)",
    "menu.nameEnPlaceholder": "بالإنجليزية",
    "menu.nameFrPlaceholder": "بالفرنسية",
    "menu.nameArPlaceholder": "بالعربية",
    "menu.nameRequired": "الاسم مطلوب بجميع اللغات الثلاث.",
    "menu.price": "السعر (د.ت)",
    "menu.pricePlaceholder": "مثال: 4.500",
    "menu.priceInvalid": "يجب أن يكون السعر رقماً موجباً.",
    "menu.image": "صورة",
    "menu.available": "متاح",
    "menu.uploading": "جاري التحميل...",
    "menu.uploadImage": "تحميل صورة",
    "menu.noFileChosen": "لم يتم اختيار ملف",
    "menu.uploadFailed": "فشل تحميل الصورة.",
    "menu.saveFailed": "فشل الحفظ. يرجى المحاولة مرة أخرى.",
    "menu.reorderFailed":
      "فشل إعادة ترتيب الفئات. تم التراجع عن التغييرات.",
    "menu.reorderItemsFailed":
      "فشل إعادة ترتيب العناصر. تم التراجع عن التغييرات.",
    "menu.availabilityFailed":
      "فشل تحديث توفر الفئة. تم التراجع عن التغييرات.",
    "menu.itemAvailabilityFailed":
      "فشل تحديث توفر العنصر. تم التراجع عن التغييرات.",
    "menu.deleteFailed":
      "فشل حذف الفئة. تم التراجع عن التغييرات.",
    "menu.deleteItemFailed":
      "فشل حذف العنصر. تم التراجع عن التغييرات.",
    "menu.dragToReorder": "اسحب لإعادة الترتيب",
    "menu.descriptionEnglish": "الوصف (بالإنجليزية)",
    "menu.descriptionFrench": "الوصف (بالفرنسية)",
    "menu.descriptionArabic": "الوصف (بالعربية)",
    "menu.descriptionEnPlaceholder": "الوصف بالإنجليزية",
    "menu.descriptionFrPlaceholder": "الوصف بالفرنسية",
    "menu.descriptionArPlaceholder": "الوصف بالعربية",
    "menu.itemImageAlt": "عنصر",
    "menu.categoryNameEn": "اسم الفئة بالإنجليزية",
    "menu.categoryNameFr": "اسم الفئة بالفرنسية",
    "menu.categoryNameAr": "اسم الفئة بالعربية",
    "menu.english": "الإنجليزية",
    "menu.french": "الفرنسية",
    "menu.arabic": "العربية",

    /** Tables */
    "table.title": "الطاولات",
    "table.subtitle": "إدارة الطاولات وتحميل رموز QR",
    "table.addTable": "+ إضافة طاولة",
    "table.adding": "جاري الإضافة...",
    "table.addTableTitle": "إضافة طاولة",
    "table.label": "اسم الطاولة",
    "table.labelPlaceholder": "مثال: طاولة 5، تراس أ",
    "table.edit": "تعديل {label}",
    "table.deleteTitle": "حذف الطاولة",
    "table.deleteConfirm":
      "هل أنت متأكد من حذف هذه الطاولة؟ لا يمكن التراجع عن هذا الإجراء.",
    "table.active": "نشط",
    "table.loadingTables": "جاري تحميل الطاولات...",
    "table.noTables": "لا توجد طاولات بعد",
    "table.noTablesDesc": "أضف طاولتك الأولى لإنشاء رموز QR.",
    "table.downloadAll": "تحميل الكل",
    "table.downloadPrint": "رموز QR - طباعة",
    "table.downloadFailed": "فشل إنشاء رموز QR للتحميل.",
    "table.png": "PNG",
    "table.svg": "SVG",
    "table.hideCode": "إخفاء الرمز",
    "table.showCode": "إظهار الرمز",
    "table.copyCode": "نسخ الرمز",
    "table.noQrCode": "لا يوجد رابط QR",
    "table.failedLoadQr": "فشل تحميل رمز QR",
    "table.failedGeneratePng": "فشل إنشاء PNG",
    "table.failedGenerateSvg": "فشل إنشاء SVG",
    "table.failedToLoad": "فشل تحميل الطاولات",
    "table.failedToDelete": "فشل حذف الطاولة",
    "table.failedToCreate": "فشل إنشاء الطاولة",
    "table.failedToUpdate": "فشل تحديث الطاولة",
    "table.clearTable": "تحرير الطاولة",
    "table.clearTableTitle": "تحرير الطاولة",
    "table.clearTableConfirm":
      "هذا ينهي الجلسة الحالية في {label}. أي زبون لا يزال هناك سيحتاج إلى مسح رمز QR مرة أخرى لبدء طلب جديد.",
    "table.clearing": "جاري التحرير...",
    "table.failedToClear": "فشل تحرير الطاولة",
    "table.loading": "جاري التحميل...",
    "table.status.occupied": "مشغولة",
    "table.status.available": "متاحة",
    "table.status.inactive": "غير نشطة",

    /** Customer Menu */
    "customer.nameTitle": "ما اسمك؟",
    "customer.namePlaceholder": "أدخل اسمك",
    "customer.nameSubmit": "دخول",
    "customer.nameRequired": "يرجى إدخال اسمك",
    "customer.nameTooLong": "الاسم طويل جداً",
    "customer.hello": "مرحباً {name}",
    "customer.menuNotAvailable": "القائمة غير متاحة",
    "customer.menuNotAvailableDesc":
      "لم يقم هذا المطعم بإضافة أي عناصر بعد.",
    "customer.tab.menu": "القائمة",
    "customer.tab.myOrders": "طلباتي",
    "customer.loading": "لحظة من فضلك",
    "customer.loadingDesc":
      "لقد أبلغنا طاقم العمل بوجودك — سيمرون للتحقق من الطاولة قريباً. يمكنك المحاولة مرة أخرى بعد ذلك.",
    "customer.tryAgain": "حاول مرة أخرى",
    "customer.tableUnavailable": "الطاولة غير متاحة",
    "customer.tableUnavailableDesc":
      "هذه الطاولة غير نشطة حالياً. يرجى طلب المساعدة من أحد الموظفين.",
    "customer.itemsUnavailable":
      "بعض العناصر لم تعد متاحة. يرجى التحديث والمحاولة مرة أخرى.",
    "customer.sessionEnded":
      "انتهت جلستك. يرجى مسح رمز QR مرة أخرى.",
    "customer.failedPlaceOrder": "فشل تقديم الطلب",
    "customer.failedPlaceOrderRetry":
      "فشل تقديم الطلب. يرجى المحاولة مرة أخرى.",

    /** Cart */
    "cart.viewCart": "عرض السلة ({count})",
    "cart.title": "سلتك",
    "cart.titleCount": "سلتك ({count})",
    "cart.empty": "سلتك فارغة",
    "cart.clear": "تفريغ",
    "cart.close": "إغلاق",
    "cart.each": "للقطعة",
    "cart.notes": "ملاحظات الطلب (اختياري)",
    "cart.total": "المجموع:",
    "cart.placeOrder": "تقديم الطلب",
    "cart.placingOrder": "جاري تقديم الطلب...",
    "cart.removeItem": "إزالة العنصر",

    /** Order */
    "order.confirmation.title": "تم تقديم الطلب!",
    "order.confirmation.body":
      "تم إرسال طلبك إلى المطبخ. سيتم إعلامك عندما يكون جاهزاً.",
    "order.continueBrowsing": "متابعة التصفح",
    "order.status.pending": "قيد الانتظار",
    "order.status.in_progress": "قيد التحضير",
    "order.status.ready": "جاهز",
    "order.status.delivered": "تم التسليم",
    "order.status.cancelled": "ملغي",
    "order.noOrders": "لا توجد طلبات بعد",
    "order.noOrdersDesc":
      "ستظهر طلباتك هنا بمجرد تقديم واحدة.",
    "order.total": "المجموع",
    "order.cancel": "إلغاء الطلب",
    "order.cancelTitle": "إلغاء الطلب",
    "order.cancelConfirm":
      "هل أنت متأكد من إلغاء هذا الطلب؟",
    "order.cancelReason": "السبب (اختياري)",
    "order.keepOrder": "الاحتفاظ بالطلب",
    "order.cancelling": "جاري الإلغاء...",
    "order.somethingWrong": "حدث خطأ ما",
    "order.failedToLoad": "فشل تحميل الطلبات",
    "order.failedToCancel": "فشل إلغاء الطلب",

    /** Actions */
    "customer.callWaiter": "استدعاء النادل",
    "customer.called": "تم الاستدعاء",
    "customer.requestBill": "طلب الفاتورة",
    "customer.requested": "تم الطلب",
    "customer.failedCallWaiter": "فشل استدعاء النادل.",
    "customer.failedRequestBill": "فشل طلب الفاتورة.",

    /** Are You With */
    "customer.areYouWith": "هل أنت مع {name}؟",
    "customer.areYouWithDesc":
      "هناك جلسة نشطة على هذه الطاولة. هل أنت مع {name}؟",

    /** Session Conflict */
    "customer.sessionConflictTitle": "تعارض الجلسة",
    "customer.sessionConflictDesc":
      "يبدو أن هناك تعارضاً في الجلسة على هذه الطاولة. هل تريد إبلاغ طاقم الصالة لحل المشكلة؟",
    "customer.sessionConflictYes": "نعم، أبلغ الموظفين",

    /** Item Detail */
    "item.notes": "ملاحظات",
    "item.notesPlaceholder": "أي طلبات خاصة؟",
    "item.quantity": "الكمية",
    "item.addToCart": "أضف إلى السلة - {price}",
    "item.addToCartAria": "أضف إلى السلة",

    /** KDS */
    "kds.ordersInQueue": "{count} طلب في الانتظار",
    "kds.ordersInQueuePlural": "{count} طلبات في الانتظار",
    "kds.allCaughtUp": "لا توجد طلبات",
    "kds.allCaughtUpDesc":
      "ستظهر الطلبات الجديدة هنا فور وصولها.",
    "kds.loadingOrders": "جاري تحميل الطلبات...",
    "kds.somethingWrong":
      "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    "kds.networkError":
      "خطأ في الشبكة — يرجى المحاولة مرة أخرى.",
    "kds.unmute": "تفعيل تنبيهات المطبخ",
    "kds.mute": "كتم تنبيهات المطبخ",
    "kds.startOrder": "بدء التحضير",
    "kds.markReady": "تعليم كجاهز",
    "kds.status.pending": "قيد الانتظار",
    "kds.status.in_progress": "قيد التحضير",
    "kds.status.ready": "جاهز",
    "kds.status.delivered": "تم التسليم",
    "kds.status.cancelled": "ملغي",
    "kds.cancelReason.outOfStock": "غير متوفر",
    "kds.cancelReason.kitchenError": "خطأ في المطبخ",
    "kds.cancelReason.other": "أخرى",
    "kds.cancelTitle": "إلغاء الطلب — {table}",
    "kds.cancelBody":
      "سيتم إزالة هذا الطلب من قائمة انتظار المطبخ. اختر سبباً:",
    "kds.cancelReasonAria": "سبب الإلغاء",
    "kds.cancelDetails": "تفاصيل",
    "kds.cancelDetailsPlaceholder": "ماذا حدث؟",
    "kds.cancelling": "جاري الإلغاء...",
    "kds.cancelOrder": "إلغاء الطلب",
    "kds.keepOrder": "الاحتفاظ بالطلب",
    "kds.retry": "إعادة المحاولة",
    "kds.failedToLoad": "فشل تحميل الطلبات",

    /** Floor Staff */
    "floor.subtitle": "التنبيهات الحية وسجل الجلسات",
    "floor.tab.feed": "التنبيهات",
    "floor.tab.sessions": "الجلسات",
    "floor.feed.empty": "لا توجد تنبيهات",
    "floor.feed.emptyDesc":
      "ستظهر التنبيهات الجديدة هنا فور وصولها.",
    "floor.card.resolve": "حل",
    "floor.card.acknowledge": "تأكيد",
    "floor.card.confirmDelivered": "تأكيد التسليم",
    "floor.card.waiterCalled": "استدعاء نادل",
    "floor.card.billRequested": "طلب فاتورة",
    "floor.card.sessionConflict": "تعارض الجلسة",
    "floor.card.orderReady": "طلب جاهز",
    "floor.card.orderCancelled": "طلب ملغي",
    "floor.sessions.empty": "لا توجد جلسات نشطة",
    "floor.sessions.emptyDesc":
      "ستظهر الجلسات النشطة هنا عند إنشائها.",
    "floor.session.total": "المجموع",
    "floor.session.noOrders": "لا توجد طلبات بعد",
    "floor.session.guest": "ضيف",
    "floor.feed.confirmClearDesc": "سيتم إغلاق الجلسة الحالية في هذه الطاولة، مما يسمح للزبائن الجدد بتقديم الطلبات.",
    "floor.failedToLoad": "فشل تحميل البيانات",
    "floor.failedResolve": "فشل حل التنبيه",
    "floor.failedDeliver": "فشل تأكيد التسليم",
    "floor.unmute": "تفعيل صوت التنبيهات",
    "floor.mute": "كتم صوت التنبيهات",
    "floor.resolving": "جاري الحل...",
    "floor.delivering": "جاري تأكيد التسليم...",

    /** Time */
    "time.inAMoment": "بعد لحظة",
    "time.inMinutes": "بعد {n} د",
    "time.inHours": "بعد {n} س",
    "time.inDays": "بعد {n} ي",
    "time.justNow": "الآن",
    "time.minutesAgo": "منذ {n} د",
    "time.hoursAgo": "منذ {n} س",
    "time.daysAgo": "منذ {n} ي",

    /** Metadata */
    "meta.title": "سربي - قائمة رقمية ونظام طلبات",
    "meta.description":
      "قوائم رقمية عبر رمز QR وطلب على الطاولة للمقاهي والمطاعم في تونس",
    "meta.menuNotFound": "القائمة غير موجودة",
    "meta.menuTitle": "{name} — قائمة رقمية",
    "meta.menuDesc": "تصفح القائمة واطلب من {name}",

    /** Dashboard */
    "dashboard.welcome": "مرحباً بك في سربي",
    "dashboard.setup": "لوحة التحكم قيد الإعداد.",

    /** Settings */
    "settings.title": "إعدادات المطعم",
    "settings.subtitle": "إدارة معلومات المطعم والموقع",
    "settings.restaurant": "المطعم",
    "settings.location": "الموقع",
    "settings.name": "اسم المطعم",
    "settings.namePlaceholder": "مثال: مقهى المنار",
    "settings.brandColors": "ألوان العلامة التجارية",
    "settings.brandColor": "لون العلامة التجارية",
    "settings.primaryColor": "اللون الأساسي",
    "settings.accentColor": "لون التمييز",
    "settings.brandPreview": "معاينة",
    "settings.previewButton": "زر رئيسي",
    "settings.previewLight": "خلفية فاتحة",
    "settings.previewFocus": "حقل مع تركيز",
    "settings.locationName": "اسم الموقع",
    "settings.locationNamePlaceholder": "مثال: المنار — وسط المدينة",
    "settings.address": "العنوان",
    "settings.addressPlaceholder": "مثال: 15 شارع الحبيب بورقيبة، تونس",
    "settings.sessionTimeout": "مهلة الجلسة (بالدقائق)",
    "settings.sessionTimeoutHelp": "مدة بقاء جلسة الزبون نشطة بدون نشاط (الافتراضي: 150 دقيقة).",
    "settings.save": "حفظ التغييرات",
    "settings.saved": "تم الحفظ.",
    "settings.saveFailed": "فشل الحفظ. يرجى المحاولة مرة أخرى.",
    "settings.loading": "جاري تحميل الإعدادات...",
    "settings.failedToLoad": "فشل تحميل الإعدادات",
    "settings.invalidColor": "يجب أن يكون لون hex صالح (مثال: #F59E0B)",

    /** Staff */
    "staff.title": "الموظفون",
    "staff.subtitle": "إدارة حسابات الموظفين والدعوات",
    "staff.add": "+ إضافة موظف",
    "staff.inviteTitle": "دعوة موظف",
    "staff.email": "البريد الإلكتروني",
    "staff.emailPlaceholder": "staff@restaurant.tn",
    "staff.name": "الاسم",
    "staff.namePlaceholder": "الاسم الكامل",
    "staff.role": "الدور",
    "staff.location": "الموقع",
    "staff.locationPlaceholder": "اختر موقعاً",
    "staff.send": "إرسال الدعوة",
    "staff.sending": "جاري الإرسال...",
    "staff.status.active": "نشط",
    "staff.status.pending": "قيد الدعوة",
    "staff.status.inactive": "غير نشط",
    "staff.role.owner": "مالك",
    "staff.role.location_manager": "مدير موقع",
    "staff.role.kitchen": "طاقم المطبخ",
    "staff.role.floor": "طاقم الصالة",
    "staff.activate": "تفعيل",
    "staff.deactivate": "إلغاء التفعيل",
    "staff.resendInvite": "إعادة إرسال الدعوة",
    "staff.removeInvite": "إزالة الدعوة",
    "staff.confirmRemoveTitle": "إزالة الدعوة",
    "staff.confirmRemove": "هل أنت متأكد من إزالة هذه الدعوة؟ لا يمكن التراجع عن هذا.",
    "staff.removing": "جاري الإزالة...",
    "staff.inviteSent": "تم إرسال الدعوة.",
    "staff.inviteResent": "تمت إعادة إرسال الدعوة.",
    "staff.inviteEmailFailed": "تم إنشاء الدعوة لكن فشل إرسال البريد الإلكتروني. انسخ الرابط أدناه وأرسله يدوياً.",
    "staff.copyLink": "نسخ الرابط",
    "staff.linkCopied": "تم نسخ الرابط!",
    "staff.inviteLink": "رابط الدعوة",
    "staff.loading": "جاري تحميل الموظفين...",
    "staff.failedToLoad": "فشل تحميل الموظفين",
    "staff.failedToInvite": "فشل إرسال الدعوة",
    "staff.failedToUpdate": "فشل تحديث الموظف",
    "staff.failedToRemove": "فشل إزالة الدعوة",
    "staff.empty": "لا يوجد موظفون بعد",
    "staff.emptyDesc": "أضف أول موظف للبدء.",

    /** Staff error codes (server returns code, client maps to these) */
    "staff.error.NOT_FOUND": "الموظف غير موجود",
    "staff.error.SELF_TARGET": "لا يمكنك تعديل حسابك الخاص",
    "staff.error.NO_AUTH_ID": "لا يمكن إلغاء تفعيل دعوة قيد الانتظار — احذفها بدلاً من ذلك",
    "staff.error.ALREADY_ACTIVE": "هذا الحساب نشط بالفعل",
    "staff.error.HAS_AUTH_ID": "لا يمكن إزالة حساب نشط. قم بإلغاء تفعيله بدلاً من ذلك.",
    "staff.error.ACCOUNT_INACTIVE": "هذا البريد الإلكتروني ينتمي إلى حساب غير نشط. أعد تفعيله من قائمة الموظفين بدلاً من إرسال دعوة جديدة.",
    "staff.error.CONFLICT": "هذا البريد الإلكتروني لديه حساب نشط بالفعل",
    "staff.error.FORBIDDEN": "ليس لديك صلاحية للقيام بذلك",
    "staff.error.GENERIC": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",

    /** Email templates */
    "email.invite.subject": "تمت دعوتك للانضمام إلى {tenantName} على سربي",
    "email.invite.greeting": "مرحباً {name}،",
    "email.invite.body": "تمت دعوتك للانضمام إلى فريق {tenantName} على سربي بصفة {role}.",
    "email.invite.cta": "إعداد حسابك",
    "email.invite.expiry": "سينتهي هذا الرابط خلال 7 أيام.",
    "email.invite.footer": "إذا لم تطلب هذا، يمكنك تجاهل هذا البريد.",

    /** Orders Dashboard */
    "orders.title": "الطلبات المباشرة",
    "orders.subtitle": "متابعة كل الطلبات النشطة في الوقت الفعلي",
    "orders.empty": "لا توجد طلبات نشطة",
    "orders.emptyDesc": "ستظهر الطلبات الجديدة هنا بمجرد وصولها.",
    "orders.loading": "جاري تحميل الطلبات...",
    "orders.filterAll": "الكل",
    "orders.searchPlaceholder": "بحث عن طاولة أو زبون...",
    "orders.clearFilters": "مسح التصفية",
    "orders.noResults": "لا توجد نتائج",
    "orders.noResultsDesc": "جرب تغيير معايير التصفية.",
    "orders.count": "{count} طلب",
    "orders.countPlural": "{count} طلبات",
    "orders.unknownTable": "طاولة غير معروفة",
    "orders.activeSection": "نشطة ({count})",
    "orders.cancellationsSection": "الإلغاءات الأخيرة ({count})",

    /** Analytics */
    "analytics.title": "الإحصائيات",
    "analytics.subtitle": "نظرة عامة على أداء مطعمك",
    "analytics.ordersToday": "طلبات اليوم",
    "analytics.revenueToday": "إيرادات اليوم",
    "analytics.avgOrderValue": "متوسط قيمة الطلب",
    "analytics.itemsSold": "عناصر مباعة",
    "analytics.range7d": "7 أيام",
    "analytics.range30d": "30 يوم",
    "analytics.range90d": "90 يوم",
    "analytics.ordersOverTime": "الطلبات عبر الزمن",
    "analytics.ordersCount": "الطلبات",
    "analytics.peakHours": "ساعات الذروة",
    "analytics.topItems": "أكثر العناصر مبيعاً",
    "analytics.noData": "لا توجد بيانات بعد",
    "analytics.loading": "جاري تحميل الإحصائيات...",
    "analytics.failedToLoad": "فشل تحميل الإحصائيات",
    "analytics.soldCount": "{count} مبيعات",

    /** Locale Names */
    "locale.ar": "العربية",
    "locale.fr": "Français",
    "locale.en": "English",
  },

  fr: {
    /** Common */
    "common.cancel": "Annuler",
    "common.clear": "Vider",
    "common.save": "Enregistrer",
    "common.saving": "Enregistrement...",
    "common.delete": "Supprimer",
    "common.deleting": "Suppression...",
    "common.loading": "Chargement...",
    "common.retry": "Réessayer",
    "common.dismiss": "Fermer",
    "common.close": "Fermer",
    "common.edit": "Modifier",
    "common.remove": "Retirer",
    "common.add": "Ajouter",
    "common.yes": "Oui",
    "common.no": "Non",
    "common.soon": "Bientôt",
    "common.uploadImage": "Télécharger une image",
    "common.dragOrClick": "ou glisser-déposer",
    "common.replaceImage": "Remplacer l'image",
    "common.uploading": "Téléchargement...",
    "common.uploadFailed": "Échec du téléchargement.",

    /** Auth */
    "auth.signIn": "Se connecter",
    "auth.signingIn": "Connexion...",
    "auth.email": "Email",
    "auth.emailPlaceholder": "vous@restaurant.tn",
    "auth.password": "Mot de passe",
    "auth.passwordPlaceholder": "Entrez votre mot de passe",
    "auth.welcome": "Bon retour",
    "auth.welcomeSub":
      "Connectez-vous pour gérer votre restaurant.",
    "auth.setup.title": "Configurez votre compte",
    "auth.setup.welcome":
      "Bienvenue, {name} — créez un mot de passe pour terminer.",
    "auth.setup.welcomeFallback":
      "Créez un mot de passe pour terminer.",
    "auth.setup.name": "Nom",
    "auth.setup.confirmPassword": "Confirmer le mot de passe",
    "auth.setup.confirmPasswordPlaceholder":
      "Répétez votre mot de passe",
    "auth.setup.creatingAccount": "Configuration...",
    "auth.setup.createAccount": "Créer un compte",
    "auth.setup.validating":
      "Validation de votre invitation...",
    "auth.setup.invalidInvite":
      "Invitation invalide ou expirée",
    "auth.setup.invalidInviteDesc":
      "Ce lien d'invitation est invalide ou a expiré. Contactez l'administrateur de votre restaurant pour en obtenir un nouveau.",
    "auth.setup.passwordMin":
      "Le mot de passe doit contenir au moins 6 caractères.",
    "auth.setup.passwordMismatch":
      "Les mots de passe ne correspondent pas.",
    "auth.setup.somethingWrong":
      "Une erreur s'est produite.",
    "auth.setup.passwordPlaceholder":
      "Au moins 6 caractères",
    "auth.wordmark": "Sarbi",
    "auth.tagline": "Menus numériques & commande à table",

    /** Navigation */
    "nav.menu": "Menu",
    "nav.tables": "Tables",
    "nav.orders": "Commandes",
    "nav.staff": "Personnel",
    "nav.analytics": "Statistiques",
    "nav.settings": "Paramètres",
    "nav.toggleMenu": "Afficher le menu",
    "nav.staffScreens": "Écrans du personnel",
    "nav.kds": "Écran Cuisine",
    "nav.floor": "Service en salle",

    /** Menu Editor */
    "menu.title": "Menu",
    "menu.subtitle": "Gérez vos catégories et articles",
    "menu.addCategory": "+ Ajouter une catégorie",
    "menu.addItem": "+ Ajouter un article",
    "menu.editCategory": "Modifier la catégorie",
    "menu.addCategoryTitle": "Ajouter une catégorie",
    "menu.editItem": "Modifier l'article",
    "menu.addItemTitle": "Ajouter un article",
    "menu.deleteCategory": "Supprimer la catégorie",
    "menu.deleteCategoryConfirm":
      "Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les articles de cette catégorie seront également supprimés.",
    "menu.deleteItem": "Supprimer l'article",
    "menu.deleteItemConfirm":
      "Êtes-vous sûr de vouloir supprimer cet article ?",
    "menu.noCategories": "Aucune catégorie pour le moment",
    "menu.noCategoriesDesc":
      "Créez votre première catégorie pour commencer.",
    "menu.noItems":
      "Aucun article. Cliquez sur \"Ajouter un article\" pour en créer un.",
    "menu.loadingMenu": "Chargement du menu...",
    "menu.failedToLoad": "Échec du chargement du menu",
    "menu.category": "Catégorie",
    "menu.nameEnglish": "Nom (Anglais)",
    "menu.nameFrench": "Nom (Français)",
    "menu.nameArabic": "Nom (Arabe)",
    "menu.nameEnPlaceholder": "En anglais",
    "menu.nameFrPlaceholder": "En français",
    "menu.nameArPlaceholder": "بالعربية",
    "menu.nameRequired":
      "Le nom est requis dans les trois langues.",
    "menu.price": "Prix (TND)",
    "menu.pricePlaceholder": "ex: 4.500",
    "menu.priceInvalid":
      "Le prix doit être un nombre positif.",
    "menu.image": "Image",
    "menu.available": "Disponible",
    "menu.uploading": "Téléchargement...",
    "menu.uploadImage": "Télécharger une image",
    "menu.noFileChosen": "Aucun fichier choisi",
    "menu.uploadFailed":
      "Échec du téléchargement de l'image.",
    "menu.saveFailed":
      "Échec de l'enregistrement. Veuillez réessayer.",
    "menu.reorderFailed":
      "Échec de la réorganisation des catégories. Modifications annulées.",
    "menu.reorderItemsFailed":
      "Échec de la réorganisation des articles. Modifications annulées.",
    "menu.availabilityFailed":
      "Échec de la mise à jour de la disponibilité de la catégorie. Modifications annulées.",
    "menu.itemAvailabilityFailed":
      "Échec de la mise à jour de la disponibilité de l'article. Modifications annulées.",
    "menu.deleteFailed":
      "Échec de la suppression de la catégorie. Modifications annulées.",
    "menu.deleteItemFailed":
      "Échec de la suppression de l'article. Modifications annulées.",
    "menu.dragToReorder": "Glisser pour réorganiser",
    "menu.descriptionEnglish": "Description (Anglais)",
    "menu.descriptionFrench": "Description (Français)",
    "menu.descriptionArabic": "Description (Arabe)",
    "menu.descriptionEnPlaceholder": "Description en anglais",
    "menu.descriptionFrPlaceholder":
      "Description en français",
    "menu.descriptionArPlaceholder": "Description بالعربية",
    "menu.itemImageAlt": "Article",
    "menu.categoryNameEn":
      "Nom de la catégorie en anglais",
    "menu.categoryNameFr":
      "Nom de la catégorie en français",
    "menu.categoryNameAr":
      "Nom de la catégorie en arabe",
    "menu.english": "Anglais",
    "menu.french": "Français",
    "menu.arabic": "Arabe",

    /** Tables */
    "table.title": "Tables",
    "table.subtitle":
      "Gérez vos tables et téléchargez les QR codes",
    "table.addTable": "+ Ajouter une table",
    "table.adding": "Ajout...",
    "table.addTableTitle": "Ajouter une table",
    "table.label": "Nom de la table",
    "table.labelPlaceholder": "ex: Table 5, Terrasse A",
    "table.edit": "Modifier {label}",
    "table.deleteTitle": "Supprimer la table",
    "table.deleteConfirm":
      "Êtes-vous sûr de vouloir supprimer cette table ? Cette action est irréversible.",
    "table.active": "Actif",
    "table.loadingTables": "Chargement des tables...",
    "table.noTables": "Aucune table pour le moment",
    "table.noTablesDesc":
      "Ajoutez votre première table pour générer des QR codes.",
    "table.downloadAll": "Tout télécharger",
    "table.downloadPrint": "QR Codes - Impression",
    "table.downloadFailed":
      "Échec de la génération des QR codes pour le téléchargement.",
    "table.png": "PNG",
    "table.svg": "SVG",
    "table.hideCode": "Masquer le code",
    "table.showCode": "Afficher le code",
    "table.copyCode": "Copier le code",
    "table.noQrCode": "Pas d'URL de QR code",
    "table.failedLoadQr": "Échec du chargement du QR",
    "table.failedGeneratePng": "Échec de la génération du PNG",
    "table.failedGenerateSvg": "Échec de la génération du SVG",
    "table.failedToLoad": "Échec du chargement des tables",
    "table.failedToDelete": "Échec de la suppression de la table",
    "table.failedToCreate": "Échec de la création de la table",
    "table.failedToUpdate":
      "Échec de la mise à jour de la table",
    "table.clearTable": "Libérer la table",
    "table.clearTableTitle": "Libérer la table",
    "table.clearTableConfirm":
      "Ceci met fin à la session en cours à {label}. Tout client encore présent devra scanner le QR code à nouveau pour commander.",
    "table.clearing": "Libération...",
    "table.failedToClear": "Échec de la libération de la table",
    "table.loading": "Chargement...",
    "table.status.occupied": "Occupée",
    "table.status.available": "Disponible",
    "table.status.inactive": "Inactive",

    /** Customer Menu */
    "customer.nameTitle": "Quel est votre nom ?",
    "customer.namePlaceholder": "Entrez votre nom",
    "customer.nameSubmit": "Entrer",
    "customer.nameRequired": "Veuillez entrer votre nom",
    "customer.nameTooLong": "Le nom est trop long",
    "customer.hello": "Bonjour, {name}",
    "customer.menuNotAvailable": "Menu non disponible",
    "customer.menuNotAvailableDesc":
      "Ce restaurant n'a pas encore ajouté d'articles.",
    "customer.tab.menu": "Menu",
    "customer.tab.myOrders": "Mes commandes",
    "customer.loading": "Un instant",
    "customer.loadingDesc":
      "Nous avons informé notre personnel de votre présence — ils passeront vérifier la table dans un instant. Vous pourrez réessayer une fois que ce sera réglé.",
    "customer.tryAgain": "Réessayer",
    "customer.tableUnavailable": "Table non disponible",
    "customer.tableUnavailableDesc":
      "Cette table est actuellement inactive. Veuillez demander l'aide d'un membre du personnel.",
    "customer.itemsUnavailable":
      "Certains articles ne sont plus disponibles. Veuillez actualiser et réessayer.",
    "customer.sessionEnded":
      "Votre session a expiré. Veuillez scanner le QR code à nouveau.",
    "customer.failedPlaceOrder": "Échec de la commande",
    "customer.failedPlaceOrderRetry":
      "Échec de la commande. Veuillez réessayer.",

    /** Cart */
    "cart.viewCart": "Voir le panier ({count})",
    "cart.title": "Votre panier",
    "cart.titleCount": "Votre panier ({count})",
    "cart.empty": "Votre panier est vide",
    "cart.clear": "Vider",
    "cart.close": "Fermer",
    "cart.each": "chacun",
    "cart.notes": "Notes de commande (optionnel)",
    "cart.total": "Total :",
    "cart.placeOrder": "Commander",
    "cart.placingOrder": "Commande en cours...",
    "cart.removeItem": "Retirer l'article",

    /** Order */
    "order.confirmation.title": "Commande passée !",
    "order.confirmation.body":
      "Votre commande a été envoyée en cuisine. Vous serez informé quand elle sera prête.",
    "order.continueBrowsing": "Continuer à naviguer",
    "order.status.pending": "En attente",
    "order.status.in_progress": "En préparation",
    "order.status.ready": "Prêt",
    "order.status.delivered": "Livré",
    "order.status.cancelled": "Annulé",
    "order.noOrders": "Pas encore de commande",
    "order.noOrdersDesc":
      "Vos commandes apparaîtront ici une fois que vous en passerez une.",
    "order.total": "Total",
    "order.cancel": "Annuler la commande",
    "order.cancelTitle": "Annuler la commande",
    "order.cancelConfirm":
      "Êtes-vous sûr de vouloir annuler cette commande ?",
    "order.cancelReason": "Raison (optionnel)",
    "order.keepOrder": "Garder la commande",
    "order.cancelling": "Annulation...",
    "order.somethingWrong": "Une erreur s'est produite",
    "order.failedToLoad": "Échec du chargement des commandes",
    "order.failedToCancel":
      "Échec de l'annulation de la commande",

    /** Actions */
    "customer.callWaiter": "Appeler le serveur",
    "customer.called": "Appelé",
    "customer.requestBill": "Demander l'addition",
    "customer.requested": "Demandé",
    "customer.failedCallWaiter":
      "Échec de l'appel du serveur.",
    "customer.failedRequestBill":
      "Échec de la demande d'addition.",

    /** Are You With */
    "customer.areYouWith": "Êtes-vous avec {name} ?",
    "customer.areYouWithDesc":
      "Il y a une session active à cette table. Êtes-vous avec {name} ?",

    /** Session Conflict */
    "customer.sessionConflictTitle": "Conflit de Session",
    "customer.sessionConflictDesc":
      "Il semble y avoir un conflit de session à cette table. Prévenir le personnel de salle ?",
    "customer.sessionConflictYes": "Oui, Prévenir",

    /** Item Detail */
    "item.notes": "Notes",
    "item.notesPlaceholder": "Des demandes spéciales ?",
    "item.quantity": "Quantité",
    "item.addToCart": "Ajouter au panier - {price}",
    "item.addToCartAria": "Ajouter au panier",

    /** KDS */
    "kds.ordersInQueue": "{count} commande en attente",
    "kds.ordersInQueuePlural":
      "{count} commandes en attente",
    "kds.allCaughtUp": "Tout est à jour",
    "kds.allCaughtUpDesc":
      "Les nouvelles commandes apparaîtront ici dès leur arrivée.",
    "kds.loadingOrders": "Chargement des commandes...",
    "kds.somethingWrong":
      "Une erreur s'est produite. Veuillez réessayer.",
    "kds.networkError":
      "Erreur réseau — veuillez réessayer.",
    "kds.unmute": "Activer les alertes cuisine",
    "kds.mute": "Désactiver les alertes cuisine",
    "kds.startOrder": "Commencer",
    "kds.markReady": "Marquer prêt",
    "kds.status.pending": "EN ATTENTE",
    "kds.status.in_progress": "EN COURS",
    "kds.status.ready": "PRÊT",
    "kds.status.delivered": "LIVRÉ",
    "kds.status.cancelled": "ANNULÉ",
    "kds.cancelReason.outOfStock": "Rupture de stock",
    "kds.cancelReason.kitchenError": "Erreur de cuisine",
    "kds.cancelReason.other": "Autre",
    "kds.cancelTitle": "Annuler la commande — {table}",
    "kds.cancelBody":
      "Cette commande sera retirée de la file d'attente de la cuisine. Choisissez une raison :",
    "kds.cancelReasonAria": "Raison de l'annulation",
    "kds.cancelDetails": "Détails",
    "kds.cancelDetailsPlaceholder":
      "Que s'est-il passé ?",
    "kds.cancelling": "Annulation...",
    "kds.cancelOrder": "Annuler la commande",
    "kds.keepOrder": "Garder la commande",
    "kds.retry": "Réessayer",
    "kds.failedToLoad": "Échec du chargement des commandes",

    /** Floor Staff */
    "floor.subtitle": "Alertes en direct et historique des sessions",
    "floor.tab.feed": "Alertes",
    "floor.tab.sessions": "Sessions",
    "floor.feed.empty": "Aucune alerte",
    "floor.feed.emptyDesc":
      "Les nouvelles alertes apparaîtront ici dès leur arrivée.",
    "floor.card.resolve": "Résoudre",
    "floor.card.acknowledge": "Acquitter",
    "floor.card.confirmDelivered": "Confirmer livraison",
    "floor.card.waiterCalled": "Appel serveur",
    "floor.card.billRequested": "Demande d'addition",
    "floor.card.sessionConflict": "Conflit de Session",
    "floor.card.orderReady": "Commande prête",
    "floor.card.orderCancelled": "Commande annulée",
    "floor.sessions.empty": "Aucune session active",
    "floor.sessions.emptyDesc":
      "Les sessions actives apparaîtront ici une fois créées.",
    "floor.session.total": "Total",
    "floor.session.noOrders": "Pas encore de commande",
    "floor.session.guest": "Invité",
    "floor.feed.confirmClearDesc": "Ceci fermera la session en cours à cette table, permettant aux nouveaux clients de passer commande.",
    "floor.failedToLoad": "Échec du chargement des données",
    "floor.failedResolve": "Échec de la résolution",
    "floor.failedDeliver": "Échec de la confirmation",
    "floor.unmute": "Activer les alertes sonores",
    "floor.mute": "Désactiver les alertes sonores",
    "floor.resolving": "Résolution...",
    "floor.delivering": "Confirmation...",

    /** Time */
    "time.inAMoment": "dans un instant",
    "time.inMinutes": "dans {n} min",
    "time.inHours": "dans {n}h",
    "time.inDays": "dans {n}j",
    "time.justNow": "à l'instant",
    "time.minutesAgo": "il y a {n} min",
    "time.hoursAgo": "il y a {n}h",
    "time.daysAgo": "il y a {n}j",

    /** Metadata */
    "meta.title":
      "Sarbi - Menu Numérique & Système de Commande",
    "meta.description":
      "Menus numériques par QR code et commande à table pour les cafés et restaurants en Tunisie",
    "meta.menuNotFound": "Menu introuvable",
    "meta.menuTitle": "{name} — Menu Numérique",
    "meta.menuDesc": "Parcourez le menu et commandez chez {name}",

    /** Dashboard */
    "dashboard.welcome": "Bienvenue sur Sarbi",
    "dashboard.setup":
      "Votre tableau de bord est en cours de configuration.",

    /** Settings */
    "settings.title": "Paramètres du restaurant",
    "settings.subtitle":
      "Gérez les informations du restaurant et de l'emplacement",
    "settings.restaurant": "Restaurant",
    "settings.location": "Emplacement",
    "settings.name": "Nom du restaurant",
    "settings.namePlaceholder": "ex: Café El Manar",
    "settings.brandColors": "Couleurs de la marque",
    "settings.brandColor": "Couleur de la marque",
    "settings.primaryColor": "Couleur principale",
    "settings.accentColor": "Couleur d'accent",
    "settings.brandPreview": "Aperçu",
    "settings.previewButton": "Bouton principal",
    "settings.previewLight": "Fond clair",
    "settings.previewFocus": "Champ avec focus",
    "settings.locationName": "Nom de l'emplacement",
    "settings.locationNamePlaceholder": "ex: El Manar — Centre Ville",
    "settings.address": "Adresse",
    "settings.addressPlaceholder":
      "ex: 15 Avenue Habib Bourguiba, Tunis",
    "settings.sessionTimeout": "Délai de session (minutes)",
    "settings.sessionTimeoutHelp":
      "Durée pendant laquelle une session client reste active sans activité (par défaut : 150 min).",
    "settings.save": "Enregistrer les modifications",
    "settings.saved": "Enregistré.",
    "settings.saveFailed":
      "Échec de l'enregistrement. Veuillez réessayer.",
    "settings.loading": "Chargement des paramètres...",
    "settings.failedToLoad": "Échec du chargement des paramètres",
    "settings.invalidColor":
      "Doit être une couleur hex valide (ex: #F59E0B)",

    /** Staff */
    "staff.title": "Personnel",
    "staff.subtitle": "Gérez les comptes et les invitations du personnel",
    "staff.add": "+ Ajouter un membre",
    "staff.inviteTitle": "Inviter un membre",
    "staff.email": "Email",
    "staff.emailPlaceholder": "staff@restaurant.tn",
    "staff.name": "Nom",
    "staff.namePlaceholder": "Nom complet",
    "staff.role": "Rôle",
    "staff.location": "Emplacement",
    "staff.locationPlaceholder": "Choisir un emplacement",
    "staff.send": "Envoyer l'invitation",
    "staff.sending": "Envoi...",
    "staff.status.active": "Actif",
    "staff.status.pending": "Invitation en attente",
    "staff.status.inactive": "Inactif",
    "staff.role.owner": "Propriétaire",
    "staff.role.location_manager": "Gérant",
    "staff.role.kitchen": "Équipe cuisine",
    "staff.role.floor": "Service en salle",
    "staff.activate": "Activer",
    "staff.deactivate": "Désactiver",
    "staff.resendInvite": "Renvoyer l'invitation",
    "staff.removeInvite": "Supprimer l'invitation",
    "staff.confirmRemoveTitle": "Supprimer l'invitation",
    "staff.confirmRemove":
      "Êtes-vous sûr de vouloir supprimer cette invitation ? Cette action est irréversible.",
    "staff.removing": "Suppression...",
    "staff.inviteSent": "Invitation envoyée.",
    "staff.inviteResent": "Invitation renvoyée.",
    "staff.inviteEmailFailed":
      "L'invitation a été créée mais l'e-mail n'a pas pu être envoyé. Copiez le lien ci-dessous et envoyez-le manuellement.",
    "staff.copyLink": "Copier le lien",
    "staff.linkCopied": "Lien copié !",
    "staff.inviteLink": "Lien d'invitation",
    "staff.loading": "Chargement du personnel...",
    "staff.failedToLoad": "Échec du chargement du personnel",
    "staff.failedToInvite": "Échec de l'envoi de l'invitation",
    "staff.failedToUpdate": "Échec de la mise à jour du membre",
    "staff.failedToRemove": "Échec de la suppression de l'invitation",
    "staff.empty": "Aucun membre pour le moment",
    "staff.emptyDesc":
      "Ajoutez votre premier membre pour commencer.",

    /** Staff error codes */
    "staff.error.NOT_FOUND": "Membre introuvable",
    "staff.error.SELF_TARGET": "Vous ne pouvez pas modifier votre propre compte",
    "staff.error.NO_AUTH_ID":
      "Les invitations en attente ne peuvent pas être désactivées — supprimez-les plutôt",
    "staff.error.ALREADY_ACTIVE": "Ce compte est déjà actif",
    "staff.error.HAS_AUTH_ID":
      "Les comptes actifs ne peuvent pas être supprimés. Désactivez-les plutôt.",
    "staff.error.ACCOUNT_INACTIVE":
      "Cet e-mail appartient à un compte désactivé. Réactivez-le depuis la liste du personnel au lieu d'envoyer une nouvelle invitation.",
    "staff.error.CONFLICT": "Cet e-mail a déjà un compte actif",
    "staff.error.FORBIDDEN": "Vous n'avez pas la permission de faire cela",
    "staff.error.GENERIC":
      "Une erreur s'est produite. Veuillez réessayer.",

    /** Email templates */
    "email.invite.subject": "Vous êtes invité(e) à rejoindre {tenantName} sur Sarbi",
    "email.invite.greeting": "Bonjour {name},",
    "email.invite.body": "Vous avez été invité(e) à rejoindre l'équipe {tenantName} sur Sarbi en tant que {role}.",
    "email.invite.cta": "Configurer votre compte",
    "email.invite.expiry": "Ce lien expire dans 7 jours.",
    "email.invite.footer":
      "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.",

    /** Orders Dashboard */
    "orders.title": "Commandes en direct",
    "orders.subtitle": "Suivez toutes les commandes actives en temps réel",
    "orders.empty": "Aucune commande active",
    "orders.emptyDesc":
      "Les nouvelles commandes apparaîtront ici dès leur arrivée.",
    "orders.loading": "Chargement des commandes...",
    "orders.filterAll": "Toutes",
    "orders.searchPlaceholder": "Rechercher table ou client...",
    "orders.clearFilters": "Effacer les filtres",
    "orders.noResults": "Aucun résultat",
    "orders.noResultsDesc": "Essayez de modifier les critères de filtre.",
    "orders.count": "{count} commande",
    "orders.countPlural": "{count} commandes",
    "orders.unknownTable": "Table inconnue",
    "orders.activeSection": "Actives ({count})",
    "orders.cancellationsSection": "Annulations récentes ({count})",

    /** Analytics */
    "analytics.title": "Statistiques",
    "analytics.subtitle": "Vue d'ensemble des performances de votre restaurant",
    "analytics.ordersToday": "Commandes aujourd'hui",
    "analytics.revenueToday": "Revenu aujourd'hui",
    "analytics.avgOrderValue": "Panier moyen",
    "analytics.itemsSold": "Articles vendus",
    "analytics.range7d": "7 jours",
    "analytics.range30d": "30 jours",
    "analytics.range90d": "90 jours",
    "analytics.ordersOverTime": "Commandes dans le temps",
    "analytics.ordersCount": "Commandes",
    "analytics.peakHours": "Heures de pointe",
    "analytics.topItems": "Articles les plus vendus",
    "analytics.noData": "Pas encore de données",
    "analytics.loading": "Chargement des statistiques...",
    "analytics.failedToLoad": "Échec du chargement des statistiques",
    "analytics.soldCount": "{count} vendus",

    /** Locale Names */
    "locale.ar": "العربية",
    "locale.fr": "Français",
    "locale.en": "English",
  },

  en: {
    /** Common */
    "common.cancel": "Cancel",
    "common.clear": "Clear",
    "common.save": "Save",
    "common.saving": "Saving...",
    "common.delete": "Delete",
    "common.deleting": "Deleting...",
    "common.loading": "Loading...",
    "common.retry": "Retry",
    "common.dismiss": "Dismiss",
    "common.close": "Close",
    "common.edit": "Edit",
    "common.remove": "Remove",
    "common.add": "Add",
    "common.yes": "Yes",
    "common.no": "No",
    "common.soon": "Soon",
    "common.uploadImage": "Upload Image",
    "common.dragOrClick": "or drag and drop",
    "common.replaceImage": "Replace Image",
    "common.uploading": "Uploading...",
    "common.uploadFailed": "Failed to upload.",

    /** Auth */
    "auth.signIn": "Sign in",
    "auth.signingIn": "Signing in...",
    "auth.email": "Email",
    "auth.emailPlaceholder": "you@restaurant.tn",
    "auth.password": "Password",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.welcome": "Welcome back",
    "auth.welcomeSub": "Sign in to manage your restaurant.",
    "auth.setup.title": "Set up your account",
    "auth.setup.welcome":
      "Welcome, {name} — create a password to finish setting up.",
    "auth.setup.welcomeFallback":
      "Create a password to finish setting up.",
    "auth.setup.name": "Name",
    "auth.setup.confirmPassword": "Confirm password",
    "auth.setup.confirmPasswordPlaceholder":
      "Repeat your password",
    "auth.setup.creatingAccount": "Setting up...",
    "auth.setup.createAccount": "Create account",
    "auth.setup.validating": "Validating your invite...",
    "auth.setup.invalidInvite": "Invalid or expired invite",
    "auth.setup.invalidInviteDesc":
      "This invite link is invalid or has expired. Contact your restaurant admin for a new one.",
    "auth.setup.passwordMin":
      "Password must be at least 6 characters.",
    "auth.setup.passwordMismatch": "Passwords do not match.",
    "auth.setup.somethingWrong": "Something went wrong.",
    "auth.setup.passwordPlaceholder":
      "At least 6 characters",
    "auth.wordmark": "Sarbi",
    "auth.tagline": "Digital menus & table ordering",

    /** Navigation */
    "nav.menu": "Menu",
    "nav.tables": "Tables",
    "nav.orders": "Orders",
    "nav.staff": "Staff",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",
    "nav.toggleMenu": "Toggle menu",
    "nav.staffScreens": "Staff Screens",
    "nav.kds": "Kitchen Display",
    "nav.floor": "Floor Staff",

    /** Menu Editor */
    "menu.title": "Menu",
    "menu.subtitle": "Manage your categories and items",
    "menu.addCategory": "+ Add Category",
    "menu.addItem": "+ Add Item",
    "menu.editCategory": "Edit Category",
    "menu.addCategoryTitle": "Add Category",
    "menu.editItem": "Edit Item",
    "menu.addItemTitle": "Add Item",
    "menu.deleteCategory": "Delete Category",
    "menu.deleteCategoryConfirm":
      "Are you sure you want to delete this category? All items in this category will also be deleted.",
    "menu.deleteItem": "Delete Item",
    "menu.deleteItemConfirm":
      "Are you sure you want to delete this item?",
    "menu.noCategories": "No categories yet",
    "menu.noCategoriesDesc":
      "Create your first category to get started.",
    "menu.noItems":
      'No items yet. Click "Add Item" to create one.',
    "menu.loadingMenu": "Loading menu...",
    "menu.failedToLoad": "Failed to load menu",
    "menu.category": "Category",
    "menu.nameEnglish": "Name (English)",
    "menu.nameFrench": "Name (French)",
    "menu.nameArabic": "Name (Arabic)",
    "menu.nameEnPlaceholder": "In English",
    "menu.nameFrPlaceholder": "En français",
    "menu.nameArPlaceholder": "بالعربية",
    "menu.nameRequired":
      "Name is required in all three languages.",
    "menu.price": "Price (TND)",
    "menu.pricePlaceholder": "e.g. 4.500",
    "menu.priceInvalid": "Price must be a positive number.",
    "menu.image": "Image",
    "menu.available": "Available",
    "menu.uploading": "Uploading...",
    "menu.uploadImage": "Upload Image",
    "menu.noFileChosen": "No file chosen",
    "menu.uploadFailed": "Failed to upload image.",
    "menu.saveFailed":
      "Failed to save. Please try again.",
    "menu.reorderFailed":
      "Failed to reorder categories. Changes reverted.",
    "menu.reorderItemsFailed":
      "Failed to reorder items. Changes reverted.",
    "menu.availabilityFailed":
      "Failed to update category availability. Changes reverted.",
    "menu.itemAvailabilityFailed":
      "Failed to update item availability. Changes reverted.",
    "menu.deleteFailed":
      "Failed to delete category. Changes reverted.",
    "menu.deleteItemFailed":
      "Failed to delete item. Changes reverted.",
    "menu.dragToReorder": "Drag to reorder",
    "menu.descriptionEnglish": "Description (English)",
    "menu.descriptionFrench": "Description (French)",
    "menu.descriptionArabic": "Description (Arabic)",
    "menu.descriptionEnPlaceholder": "Description in English",
    "menu.descriptionFrPlaceholder":
      "Description en français",
    "menu.descriptionArPlaceholder": "Description بالعربية",
    "menu.itemImageAlt": "Item",
    "menu.categoryNameEn": "Category name in English",
    "menu.categoryNameFr": "Nom de la catégorie en français",
    "menu.categoryNameAr": "اسم الفئة بالعربية",
    "menu.english": "English",
    "menu.french": "French",
    "menu.arabic": "Arabic",

    /** Tables */
    "table.title": "Tables",
    "table.subtitle":
      "Manage your tables and download QR codes",
    "table.addTable": "+ Add Table",
    "table.adding": "Adding...",
    "table.addTableTitle": "Add Table",
    "table.label": "Table Label",
    "table.labelPlaceholder": "e.g. Table 5, Terrasse A",
    "table.edit": "Edit {label}",
    "table.deleteTitle": "Delete Table",
    "table.deleteConfirm":
      "Are you sure you want to delete this table? This action cannot be undone.",
    "table.active": "Active",
    "table.loadingTables": "Loading tables...",
    "table.noTables": "No tables yet",
    "table.noTablesDesc":
      "Add your first table to generate QR codes.",
    "table.downloadAll": "Download All",
    "table.downloadPrint": "QR Codes - Print",
    "table.downloadFailed":
      "Failed to generate QR codes for download.",
    "table.png": "PNG",
    "table.svg": "SVG",
    "table.hideCode": "Hide code",
    "table.showCode": "Show code",
    "table.copyCode": "Copy code",
    "table.noQrCode": "No QR code URL",
    "table.failedLoadQr": "Failed to load QR",
    "table.failedGeneratePng": "Failed to generate PNG",
    "table.failedGenerateSvg": "Failed to generate SVG",
    "table.failedToLoad": "Failed to load tables",
    "table.failedToDelete": "Failed to delete table",
    "table.failedToCreate": "Failed to create table",
    "table.failedToUpdate": "Failed to update table",
    "table.clearTable": "Clear Table",
    "table.clearTableTitle": "Clear Table",
    "table.clearTableConfirm":
      "This ends the current session at {label}. Any customer still there will need to scan the QR code again to start a new order.",
    "table.clearing": "Clearing...",
    "table.failedToClear": "Failed to clear table",
    "table.loading": "Loading...",
    "table.status.occupied": "Occupied",
    "table.status.available": "Available",
    "table.status.inactive": "Inactive",

    /** Customer Menu */
    "customer.nameTitle": "What's your name?",
    "customer.namePlaceholder": "Enter your name",
    "customer.nameSubmit": "Enter",
    "customer.nameRequired": "Please enter your name",
    "customer.nameTooLong": "Name is too long",
    "customer.hello": "Hello, {name}",
    "customer.menuNotAvailable": "Menu not available",
    "customer.menuNotAvailableDesc":
      "This restaurant has not added any items yet.",
    "customer.tab.menu": "Menu",
    "customer.tab.myOrders": "My Orders",
    "customer.loading": "Just a Moment",
    "customer.loadingDesc":
      "We've let our staff know you're here — they'll be over to check the table shortly. You can try again once they've sorted it out.",
    "customer.tryAgain": "Try Again",
    "customer.tableUnavailable": "Table Unavailable",
    "customer.tableUnavailableDesc":
      "This table is currently inactive. Please ask a staff member for assistance.",
    "customer.itemsUnavailable":
      "Some items are no longer available. Please refresh and try again.",
    "customer.sessionEnded":
      "Your session has ended. Please scan the QR code again.",
    "customer.failedPlaceOrder": "Failed to place order",
    "customer.failedPlaceOrderRetry":
      "Failed to place order. Please try again.",

    /** Cart */
    "cart.viewCart": "View Cart",
    "cart.title": "Your Cart",
    "cart.titleCount": "Your Cart ({count})",
    "cart.empty": "Your cart is empty",
    "cart.clear": "Clear",
    "cart.close": "Close",
    "cart.each": "each",
    "cart.notes": "Order notes (optional)",
    "cart.total": "Total:",
    "cart.placeOrder": "Place Order",
    "cart.placingOrder": "Placing Order...",
    "cart.removeItem": "Remove item",

    /** Order */
    "order.confirmation.title": "Order Placed!",
    "order.confirmation.body":
      "Your order has been sent to the kitchen. You will be notified when it is ready.",
    "order.continueBrowsing": "Continue Browsing",
    "order.status.pending": "Pending",
    "order.status.in_progress": "Preparing",
    "order.status.ready": "Ready",
    "order.status.delivered": "Delivered",
    "order.status.cancelled": "Cancelled",
    "order.noOrders": "No orders yet",
    "order.noOrdersDesc":
      "Your orders will appear here once you place one.",
    "order.total": "Total",
    "order.cancel": "Cancel order",
    "order.cancelTitle": "Cancel Order",
    "order.cancelConfirm":
      "Are you sure you want to cancel this order?",
    "order.cancelReason": "Reason (optional)",
    "order.keepOrder": "Keep order",
    "order.cancelling": "Cancelling...",
    "order.somethingWrong": "Something went wrong",
    "order.failedToLoad": "Failed to load orders",
    "order.failedToCancel": "Failed to cancel order",

    /** Actions */
    "customer.callWaiter": "Call Waiter",
    "customer.called": "Called",
    "customer.requestBill": "Request Bill",
    "customer.requested": "Requested",
    "customer.failedCallWaiter": "Failed to call waiter.",
    "customer.failedRequestBill": "Failed to request bill.",

    /** Are You With */
    "customer.areYouWith": "Are you with {name}?",
    "customer.areYouWithDesc":
      "There is an active session at this table. Are you with {name}?",

    /** Session Conflict */
    "customer.sessionConflictTitle": "Table Conflict",
    "customer.sessionConflictDesc":
      "There appears to be a session conflict at this table. Notify floor staff to resolve?",
    "customer.sessionConflictYes": "Yes, Notify Staff",

    /** Item Detail */
    "item.notes": "Notes",
    "item.notesPlaceholder": "Any special requests?",
    "item.quantity": "Quantity",
    "item.addToCart": "Add to Cart - {price}",
    "item.addToCartAria": "Add to cart",

    /** KDS */
    "kds.ordersInQueue": "{count} order in queue",
    "kds.ordersInQueuePlural": "{count} orders in queue",
    "kds.allCaughtUp": "All caught up",
    "kds.allCaughtUpDesc":
      "New orders will appear here the moment they come in.",
    "kds.loadingOrders": "Loading orders...",
    "kds.somethingWrong":
      "Something went wrong. Please try again.",
    "kds.networkError": "Network error — please try again.",
    "kds.unmute": "Unmute kitchen alerts",
    "kds.mute": "Mute kitchen alerts",
    "kds.startOrder": "Start Order",
    "kds.markReady": "Mark Ready",
    "kds.status.pending": "PENDING",
    "kds.status.in_progress": "IN PROGRESS",
    "kds.status.ready": "READY",
    "kds.status.delivered": "DELIVERED",
    "kds.status.cancelled": "CANCELLED",
    "kds.cancelReason.outOfStock": "Out of stock",
    "kds.cancelReason.kitchenError": "Kitchen error",
    "kds.cancelReason.other": "Other",
    "kds.cancelTitle": "Cancel order — {table}",
    "kds.cancelBody":
      "This order will be removed from the kitchen queue. Choose a reason:",
    "kds.cancelReasonAria": "Cancellation reason",
    "kds.cancelDetails": "Details",
    "kds.cancelDetailsPlaceholder": "What happened?",
    "kds.cancelling": "Cancelling...",
    "kds.cancelOrder": "Cancel order",
    "kds.keepOrder": "Keep order",
    "kds.retry": "Retry",
    "kds.failedToLoad": "Failed to load orders",

    /** Floor Staff */
    "floor.subtitle": "Live alerts & session history",
    "floor.tab.feed": "Alerts",
    "floor.tab.sessions": "Sessions",
    "floor.feed.empty": "All clear",
    "floor.feed.emptyDesc":
      "New alerts will appear here the moment they come in.",
    "floor.card.resolve": "Resolve",
    "floor.card.acknowledge": "Acknowledge",
    "floor.card.confirmDelivered": "Confirm Delivered",
    "floor.card.waiterCalled": "Waiter Called",
    "floor.card.billRequested": "Bill Requested",
    "floor.card.sessionConflict": "Session Conflict",
    "floor.card.orderReady": "Order Ready",
    "floor.card.orderCancelled": "Order Cancelled",
    "floor.sessions.empty": "No active sessions",
    "floor.sessions.emptyDesc":
      "Active sessions will appear here once created.",
    "floor.session.total": "Total",
    "floor.session.noOrders": "No orders yet",
    "floor.session.guest": "Guest",
    "floor.feed.confirmClearDesc": "This will close the current session at this table, allowing new customers to order.",
    "floor.failedToLoad": "Failed to load data",
    "floor.failedResolve": "Failed to resolve",
    "floor.failedDeliver": "Failed to confirm delivery",
    "floor.unmute": "Unmute floor alerts",
    "floor.mute": "Mute floor alerts",
    "floor.resolving": "Resolving...",
    "floor.delivering": "Confirming delivery...",

    /** Time */
    "time.inAMoment": "in a moment",
    "time.inMinutes": "in {n}m",
    "time.inHours": "in {n}h",
    "time.inDays": "in {n}d",
    "time.justNow": "just now",
    "time.minutesAgo": "{n}m ago",
    "time.hoursAgo": "{n}h ago",
    "time.daysAgo": "{n}d ago",

    /** Metadata */
    "meta.title": "Sarbi - Digital Menu & Ordering System",
    "meta.description":
      "QR-based digital menus and table ordering for cafés and restaurants in Tunisia",
    "meta.menuNotFound": "Menu not found",
    "meta.menuTitle": "{name} — Digital Menu",
    "meta.menuDesc": "Browse the menu and order from {name}",

    /** Dashboard */
    "dashboard.welcome": "Welcome to Sarbi",
    "dashboard.setup": "Your dashboard is being set up.",

    /** Settings */
    "settings.title": "Restaurant Settings",
    "settings.subtitle": "Manage restaurant and location details",
    "settings.restaurant": "Restaurant",
    "settings.location": "Location",
    "settings.name": "Restaurant name",
    "settings.namePlaceholder": "e.g. Café El Manar",
    "settings.brandColors": "Brand colors",
    "settings.brandColor": "Brand color",
    "settings.primaryColor": "Primary color",
    "settings.accentColor": "Accent color",
    "settings.brandPreview": "Preview",
    "settings.previewButton": "Primary button",
    "settings.previewLight": "Light surface",
    "settings.previewFocus": "Focused field",
    "settings.locationName": "Location name",
    "settings.locationNamePlaceholder": "e.g. El Manar — Centre Ville",
    "settings.address": "Address",
    "settings.addressPlaceholder": "e.g. 15 Avenue Habib Bourguiba, Tunis",
    "settings.sessionTimeout": "Session timeout (minutes)",
    "settings.sessionTimeoutHelp":
      "How long a customer session stays active without activity (default: 150 min).",
    "settings.save": "Save changes",
    "settings.saved": "Saved.",
    "settings.saveFailed": "Failed to save. Please try again.",
    "settings.loading": "Loading settings...",
    "settings.failedToLoad": "Failed to load settings",
    "settings.invalidColor": "Must be a valid hex color (e.g. #F59E0B)",

    /** Staff */
    "staff.title": "Staff",
    "staff.subtitle": "Manage staff accounts and invitations",
    "staff.add": "+ Add Member",
    "staff.inviteTitle": "Invite Member",
    "staff.email": "Email",
    "staff.emailPlaceholder": "staff@restaurant.tn",
    "staff.name": "Name",
    "staff.namePlaceholder": "Full name",
    "staff.role": "Role",
    "staff.location": "Location",
    "staff.locationPlaceholder": "Select a location",
    "staff.send": "Send Invite",
    "staff.sending": "Sending...",
    "staff.status.active": "Active",
    "staff.status.pending": "Pending Invite",
    "staff.status.inactive": "Inactive",
    "staff.role.owner": "Owner",
    "staff.role.location_manager": "Location Manager",
    "staff.role.kitchen": "Kitchen",
    "staff.role.floor": "Floor",
    "staff.activate": "Activate",
    "staff.deactivate": "Deactivate",
    "staff.resendInvite": "Resend Invite",
    "staff.removeInvite": "Remove Invite",
    "staff.confirmRemoveTitle": "Remove Invite",
    "staff.confirmRemove":
      "Are you sure you want to remove this invite? This cannot be undone.",
    "staff.removing": "Removing...",
    "staff.inviteSent": "Invite sent.",
    "staff.inviteResent": "Invite resent.",
    "staff.inviteEmailFailed":
      "Invite was created but the email could not be sent. Copy the link below and send it manually.",
    "staff.copyLink": "Copy Link",
    "staff.linkCopied": "Link copied!",
    "staff.inviteLink": "Invite link",
    "staff.loading": "Loading staff...",
    "staff.failedToLoad": "Failed to load staff",
    "staff.failedToInvite": "Failed to send invite",
    "staff.failedToUpdate": "Failed to update member",
    "staff.failedToRemove": "Failed to remove invite",
    "staff.empty": "No staff yet",
    "staff.emptyDesc": "Add your first team member to get started.",

    /** Staff error codes */
    "staff.error.NOT_FOUND": "Member not found",
    "staff.error.SELF_TARGET": "You cannot modify your own account",
    "staff.error.NO_AUTH_ID":
      "Pending invites cannot be deactivated — remove them instead",
    "staff.error.ALREADY_ACTIVE": "This account is already active",
    "staff.error.HAS_AUTH_ID":
      "Active accounts cannot be removed. Deactivate them instead.",
    "staff.error.ACCOUNT_INACTIVE":
      "This email belongs to a deactivated account. Reactivate it from the staff list instead of sending a new invite.",
    "staff.error.CONFLICT": "This email already has an active account",
    "staff.error.FORBIDDEN": "You don't have permission to do that",
    "staff.error.GENERIC": "Something went wrong. Please try again.",

    /** Email templates */
    "email.invite.subject": "You're invited to {tenantName} on Sarbi",
    "email.invite.greeting": "Hi {name},",
    "email.invite.body":
      "You've been invited to join {tenantName} on Sarbi as {role}.",
    "email.invite.cta": "Set up your account",
    "email.invite.expiry": "This link expires in 7 days.",
    "email.invite.footer":
      "If you didn't request this, you can ignore this email.",

    /** Orders Dashboard */
    "orders.title": "Live Orders",
    "orders.subtitle": "Track all active orders in real time",
    "orders.empty": "No active orders",
    "orders.emptyDesc": "New orders will appear here as they come in.",
    "orders.loading": "Loading orders...",
    "orders.filterAll": "All",
    "orders.searchPlaceholder": "Search tables or customers...",
    "orders.clearFilters": "Clear filters",
    "orders.noResults": "No results",
    "orders.noResultsDesc": "Try changing your filter criteria.",
    "orders.count": "{count} order",
    "orders.countPlural": "{count} orders",
    "orders.unknownTable": "Unknown table",
    "orders.activeSection": "Active ({count})",
    "orders.cancellationsSection": "Recent cancellations ({count})",

    /** Analytics */
    "analytics.title": "Analytics",
    "analytics.subtitle": "Overview of your restaurant's performance",
    "analytics.ordersToday": "Orders today",
    "analytics.revenueToday": "Revenue today",
    "analytics.avgOrderValue": "Avg order value",
    "analytics.itemsSold": "Items sold",
    "analytics.range7d": "7 days",
    "analytics.range30d": "30 days",
    "analytics.range90d": "90 days",
    "analytics.ordersOverTime": "Orders over time",
    "analytics.ordersCount": "Orders",
    "analytics.peakHours": "Peak hours",
    "analytics.topItems": "Top selling items",
    "analytics.noData": "No data yet",
    "analytics.loading": "Loading analytics...",
    "analytics.failedToLoad": "Failed to load analytics",
    "analytics.soldCount": "{count} sold",

    /** Locale Names */
    "locale.ar": "العربية",
    "locale.fr": "Français",
    "locale.en": "English",
  },
};

export function t(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const map = labels[locale];
  let value = map?.[key];
  if (typeof value !== "string") {
    value = labels["en"][key];
  }
  if (typeof value !== "string") {
    return key;
  }
  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      value = value.replaceAll(`{${paramKey}}`, String(paramVal));
    }
  }
  return value;
}

export function getLocaleFromAcceptLanguage(
  header: string | null
): Locale {
  if (!header) return "fr";
  const parts = header
    .split(",")
    .map((part) => {
      const [lang, q = "q=1.0"] = part.split(";");
      const code = lang.trim().slice(0, 2);
      const quality = parseFloat(q.split("=")[1] ?? "1.0");
      return { code, quality };
    })
    .sort((a, b) => b.quality - a.quality);
  for (const { code } of parts) {
    if (code === "ar") return "ar";
    if (code === "fr") return "fr";
    if (code === "en") return "en";
  }
  return "fr";
}

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
