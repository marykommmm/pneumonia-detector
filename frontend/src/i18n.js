import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  uk: {
    translation: {
      // ========== ДОМАШНЯ СТОРІНКА ==========
      home: {
        // --- Головна секція (Hero) ---
        hero_title_1: "Штучний інтелект",
        hero_title_2: "для діагностики",
        hero_title_highlight: "пневмонії",
        hero_desc:
          "Інтерактивна платформа для навчання та самоперевірки з визначення пневмонії на рентгенівських знімках за допомогою штучного інтелекту.",
        btn_diagnosis: "Почати тренування",
        btn_more: "Дізнатися більше",
        ai_active: "AI для здорового майбутнього",

        // --- Міні-переваги під кнопками ---
        feat_reliable: "Надійно",
        feat_reliable_desc: "AI-модель з високою точністю",
        feat_educational: "Професійно",
        feat_educational_desc: "Інтерактивні кейси та зворотний зв'язок",
        feat_effective: "Ефективно",
        feat_effective_desc: "Покращуйте свої навички щодня",

        // --- Блок з результатом аналізу (на макеті рентгену) ---
        result_label: "Результат аналізу",
        analysis_accuracy: "Ймовірність пневмонії",

        // --- Інформаційна секція (Що таке пневмонія?) ---
        info_about_title: "Що таке пневмонія?",
        info_about_desc:
          "Пневмонія — це інфекційне захворювання легень, яке викликає запалення легеневої тканини. Вчасна діагностика допомагає ефективно лікувати та запобігати ускладненням.",
        info_list_1: "Інфекція легеневої тканини",
        info_list_2: "Ускладнює дихання",
        info_list_3: "Може супроводжуватися лихоманкою та кашлем",

        // --- Інформаційна секція (Чому це важливо?) ---
        why_important_title: "Чому це важливо?",
        why_important_desc:
          "Пневмонія є однією з найпоширеніших причин госпіталізації у світі. Швидка та точна діагностика значно підвищує шанси на одужання.",
        stat_cases: "випадків пневмонії щороку у світі",
        stat_deaths: "смертей щороку через пневмонію",
        stat_survival:
          "випадків можна ефективно лікувати при ранньому виявленні",

        // --- Як це працює ---
        how_it_works: "Як працює наша платформа?",
        step1_title: "Завантажте знімок",
        step1_desc:
          "Отримайте рентгенівський знімок грудної клітки для аналізу.",
        step2_title: "AI аналізує",
        step2_desc:
          "Наша модель аналізує знімок та порівнює з вашою розміткою.",
        step3_title: "Отримайте результат",
        step3_desc:
          "Дізнайтесь оцінку точності та рекомендації для покращення.",
        step4_title: "Покращуйте навички",
        step4_desc: "Тренуйтесь на різних кейсах та відстежуйте свій прогрес.",

        // --- Чому обирають нас ---
        why_choose_title: "Чому обирають LungAI?",
        benefit_1: "Сучасні AI-моделі для аналізу рентгенівських знімків",
        benefit_2: "Інтерактивне навчання з миттєвим зворотним зв'язком",
        benefit_3: "Реальні медичні кейси та різні рівні складності",
        benefit_4: "Детальна статистика та історія ваших результатів",
        benefit_5: "Підходить для студентів, лікарів та медичних працівників",

        // --- Наша мета (Картка) ---
        target_title: "Наша мета",
        target_desc:
          "Допомогти медичним працівникам та студентам опанувати навички інтерпретації рентгенівських знімків за допомогою штучного інтелекту та сучасних технологій.",
        btn_start_now: "Почати зараз",

        // --- Футер безпеки ---
        security_footer:
          "Ваші дані захищені. Ми дотримуємось високих стандартів безпеки та конфіденційності.",
        risk_title: "Фактори ризику розвитку пневмонії",
        risk_subtitle:
          "Розуміння факторів ризику допомагає запобігти захворюванню та захистити своє здоров'я.",
        risk_1_title: "Ослаблений імунітет",
        risk_1_desc:
          "Знижений імунітет підвищує ризик бактеріальних та вірусних інфекцій.",
        risk_2_title: "Шкідливі звички",
        risk_2_desc:
          "Пошкоджують легеневу тканину та знижують захисні функції дихальної системи.",
        risk_3_title: "Хронічні захворювання",
        risk_3_desc:
          "ХОЗЛ, астма та серцеві патології можуть ускладнювати перебіг пневмонії.",
        risk_4_title: "Вікові групи ризику",
        risk_4_desc:
          "Діти та люди похилого віку мають вищу ймовірність ускладнень.",
        cta_title: "Готові покращити свої навички діагностики?",
        cta_desc:
          "Приєднуйтесь до лікарів, студентів та медичних працівників, які вже використовують LungAI для навчання та практики.",
        btn_start_analysis: "Почати аналіз зараз",
        cta_note: "Безкоштовно • Потрібна реєстрація",
        footer_desc:
          "AI-платформа для діагностики пневмонії та навчання на рентгенівських знімках.",
        contact_us: "Зв'яжіться з нами",
        all_rights: "Усі права захищені.",
      },
      // ========== НАВІГАЦІЯ ==========
      nav: {
        logo: "LungAI",
        home: "Головна",
        dashboard: "Кабінет",
        diagnosis: "Діагностика",
        training: "Тренажер",
        profile: "Профіль",
        history: "Історія",
        settings: "Налаштування",
        logout: "Вийти",
        login: "Увійти",
      },
      // ========== АВТОРИЗАЦІЯ ==========
      auth: {
        login_title: "Вхід",
        register_title: "Реєстрація",
        name_placeholder: "Ім'я",
        email_placeholder: "Email",
        password_placeholder: "Пароль",
        btn_loading: "Завантаження...",
        btn_login: "Увійти",
        btn_register: "Зареєструватися",
        switch_to_register: "Реєстрація нового акаунта",
        switch_to_login: "Вже є акаунт? Вхід",
        error_default: "Помилка при автентифікації",
      },

      dashboard: {
        title: "Мій Кабінет",
        welcome: "Ласкаво просимо, {{name}}",
        settings: "Налаштування",
        language_select: "Мова інтерфейсу:",
        loading: "Завантажую...",
        error: "Помилка",
        retry: "Спробувати ще раз",
        error_not_logged_in: "Користувач не залогінений",

        // Секція профілю
        profile: "Профіль",
        subtitle: "Особиста інформація та статистика",
        role_admin: "Адміністратор",
        role_student: "Студент",
        pro_account: "Професійний акаунт",
        name_label: "Ім'я:",
        email_label: "Email:",
        reg_date_label: "Дата реєстрації",

        // Секція статистики
        stats_title: "Статистика",
        stat_total_sessions: "Всього сесій",
        stat_avg_score: "Середній бал",
        stat_success_rate: "Успішність",
        stat_best_score: "Найкращий бал",

        // Компетенції та скіли
        comp_title: "Рівень компетентності",
        comp_no_data: "Немає даних",
        comp_no_data_desc:
          "Пройдіть перше тренування, щоб побачити свій рівень.",
        comp_high: "Високий",
        comp_high_desc:
          "Ви показуєте відмінні результати! Продовжуйте в тому ж дусі.",
        comp_medium: "Середній",
        comp_medium_desc:
          "Гарний старт! Регулярна практика допоможе покращити точність.",
        comp_low: "Початковий",
        comp_low_desc: "Аналізуйте помилки та уважніше вивчайте еталони ШІ.",
        comp_level_label: "Рівень",

        skill_diag: "Діагностика пневмонії",
        skill_interp: "Інтерпретація знімків",
        skill_anomaly: "Виявлення аномалій",
        skill_accuracy: "Точність аналізу",

        tip_title: "Порада дня",
        tip_desc:
          "Регулярна практика з різними типами знімків допомагає покращити точність діагностики.",

        // Секція історії
        history: "Історія тренувань",
        table_date: "Дата",
        table_mode: "Режим",
        table_image: "Знімок",
        table_result: "Результат",
        no_results: "Ще немає результатів. Почни тренуватися!",
        mode_training: "Тренажер",
        mode_diagnosis: "Діагностика",
        custom_image: "Свій знімок",
        score_analysis: "Аналіз",
      },

      diagnosis: {
        page_title: "Діагностика пневмонії",
        step_upload: "Завантаження",
        step_analyze: "Аналіз",
        step_result: "Результат",

        upload_title:
          "Перетягніть зображення сюди<br />або натисніть для вибору файлу",
        upload_formats: "Підтримуються формати: PNG, JPG (до 20MB)",
        btn_choose_file: "Вибрати файл",

        preview_title: "Знімок готовий до аналізу",
        preview_desc:
          "Модель ШІ проаналізує зображення на наявність ознак пневмонії.",
        btn_start_analysis: "Почати аналіз",
        btn_choose_other: "Вибрати інший файл",

        tips_title: "Поради для якісного знімка",
        tip1: "Переконайтесь у правильному положенні пацієнта",
        tip2: "Зображення має бути чітким і без артефактів",
        tip3: "Підтримуються передньо-задні та задньо-передні проекції",
        disclaimer: "Цей сервіс не замінює професійну медичну консультацію.",

        analyzing_title: "Аналізуємо знімок...",
        analyzing_desc:
          "Це може зайняти кілька секунд. Штучний інтелект шукає ознаки патологій.",

        result_disclaimer:
          "Результат має довідковий характер і не є остаточним діагнозом.",
        btn_save_report: "Зберегти звіт",
        results_title: "Результат аналізу",

        norm_title: "НОРМА",
        norm_label: "Патологій не виявлено",
        pneumonia_title: "ПНЕВМОНІЯ ВИЯВЛЕНА",

        zones_detected: "Виявлено зон ураження:",
        found_areas: "Виявлені області",
        area_label: "Зона ураження №{{id}}",
        right_lung: "права легеня",
        left_lung: "ліва легеня",
        total_area: "Загальна площа ураження:",
        no_pathologies: "Патологічних змін не виявлено",

        rec_title: "Рекомендація",
        rec_pneumonia:
          "Рекомендується термінова консультація лікаря-пульмонолога та додаткове обстеження.",
        rec_normal:
          "Знімок у межах норми. Рекомендується плановий огляд за графіком.",
        btn_new_analysis: "Новий аналіз",

        error_no_file: "Будь ласка, виберіть файл",
        error_api: "Помилка при аналізі: {{message}}",
        sev_title: "Діапазон оцінки ризику",
        sev_normal: "Відхилень не виявлено",
        sev_mild: "Легка форма (початкова)",
        sev_moderate: "Середня форма (помірна)",
        sev_severe: "Гостра форма (високий ризик)",
        rec_borderline:
          "Показник у «сірій зоні». Чітких ознак пневмонії немає, але присутні незначні відхилення або тіні. Рекомендується спостереження та огляд лікаря за наявності симптомів (кашель, температура).",
        probability: "Ймовірність патології:",
      },

      training: {
        title: "Тренажер",
        practice_tab: "Практика",
        exam_tab: "Іспит",

        diff_select_title: "Вибір складності",
        diff_select_desc:
          "Оберіть рівень складності для початку тренування. Система буде автоматично підбирати випадкові знімки з бази.",

        diff_easy_title: "Легкий рівень",
        diff_easy_desc:
          "Очевидні патології та повністю здорові знімки. Ідеально для розминки та базового навчання.",
        diff_medium_title: "Середній рівень",
        diff_medium_desc:
          "Типові клінічні випадки. Двобічні запалення, менш виражені тіні та змішані діагнози.",
        diff_hard_title: "Складний рівень",
        diff_hard_desc:
          "Атипові, слабковиражені та приховані патології. Справжній виклик для досвідчених спеціалістів.",
        btn_start_practice: "Почати практику",

        exam_title: "Симуляція іспиту",
        exam_desc:
          "15 знімків, суворий таймер (30 сек/знімок) та сліпа перевірка. Фідбек та оцінка надаються лише після завершення всіх завдань.",
        btn_start_exam: "Почати іспит",

        btn_interrupt_exam: "Перервати іспит",
        back_btn: "Назад до списку",
        exam_progress: "Знімок {{current}} з {{total}}",
        mode_practice: "Режим: Практика",

        loading: "Аналізую...",
        boxes_drawn: "Знайдено зон: {{count}}",
        instruction_drag: "Затисніть ліву кнопку миші, щоб виділити запалення",
        btn_clear: "Очистити",
        btn_normal: "Здоровий (Норма)",
        btn_check: "Перевірити",
        btn_submit_exam: "Зафіксувати",

        result_title: "Аналіз результату",
        diff_easy: "Легкий",
        diff_medium: "Середній",
        diff_hard: "Складний",

        feedback_correct_no_pneumonia: "Ідеально! Патологій не виявлено.",
        feedback_false_positive_healthy:
          "Увага! Виділено {{count}} хибних зон на здоровому знімку.",
        feedback_critical_miss:
          "Критична помилка: пропущено {{count}} зон запалення.",

        metric_area_error: "Відносна похибка площі",
        metric_mse: "Квадратична похибка (MSE)",
        metric_iou: "Точність локалізації (IoU)",
        correct_boxes: "Еталон від ШІ (Зелений)",
        btn_next: "Наступний випадковий знімок",

        exam_report_title: "Звіт за результатами іспиту",
        stats_images: "Знімків",
        stats_missed: "Пропущено",
        stats_false: "Хибні рамки",
        exam_details_title: "Детальний аналіз знімків:",
        image_number: "Знімок №{{id}}",
        metric_rel_short: "Відн. похибка:",
        metric_mse_short: "MSE:",
        score_label: "Бал:",
        btn_new_exam: "Почати новий іспит",
        btn_back_menu: "Повернутися в меню",

        error_no_images_level:
          "Знімків з рівнем '{{level}}' поки немає в базі.",
        error_load: "Помилка завантаження знімка: {{message}}",
        error_exam_loading:
          "Завантаження бази іспитів... Спробуйте ще раз за мить.",
        error_check: "Помилка перевірки: {{message}}",

        recommendations: {
          title: "💡 Рекомендація ШІ:",
          excellent:
            "Відмінна робота! Ваші навички діагностики на найвищому рівні. Продовжуйте в тому ж дусі.",
          overdiagnosis:
            "У вас багато хибних виділень (гіпердіагностика). Ви схильні бачити патологію там, де її немає. Уважніше вивчайте знімки 'Норми'.",
          underdiagnosis:
            "Ви пропускаєте багато наявних патологій. Сконцентруйте увагу на пошуку дрібних та слабко виражених вогнищ.",
          precision:
            "Ви знаходите запалення, але ваші рамки неточні (висока похибка площі). Намагайтеся обводити межі патології щільніше.",
          hard_practice:
            "Рекомендуємо тренуватися у вільній практиці на 'Складному' рівні, щоб покращити уважність.",
          general:
            "Рекомендуємо більше тренуватися у вільній практиці для закріплення навичок.",
        },
      },

      settings: {
        title: "Налаштування",
        subtitle: "Керування вашим акаунтом та параметрами",
        role_admin: "Адміністратор",
        role_student: "Студент / Лікар",

        account_title: "Обліковий запис",
        fullname_label: "Повне ім'я",
        email_label: "Email",
        role_label: "Спеціальність (Роль)",
        role_hint: "* Змінити роль може лише адміністратор",
        saving: "Зберігаю...",
        save_changes: "Зберегти зміни",

        system_title: "Параметри системи",
        language_label: "Мова інтерфейсу",
        theme_label: "Тема оформлення",
        theme_light: "Світла тема",
        theme_dark: "Темна тема",

        password_title: "Зміна пароля",
        current_password: "Поточний пароль",
        new_password: "Новий пароль",
        confirm_password: "Підтвердьте новий пароль",
        change_password_btn: "Змінити пароль",

        danger_zone_title: "Небезпечна зона",
        logout_title: "Вихід з системи",
        logout_desc: "Завершити поточний сеанс на цьому пристрої.",
        logout_btn: "Вийти",
        delete_account_title: "Видалити акаунт",
        delete_account_desc: "Цю дію неможливо скасувати.",
        delete_btn: "Видалити",

        // Повідомлення (Toasts)
        msg_profile_success: "Профіль успішно оновлено!",
        msg_profile_error: "Помилка оновлення",
        msg_pwd_mismatch: "Нові паролі не співпадають",
        msg_pwd_success: "Пароль успішно змінено!",
        msg_pwd_error: "Помилка при зміні пароля",
      },

      // ========== СПІЛЬНІ ПОВІДОМЛЕННЯ ==========
      common: {
        loading: "Завантажуюю...",
        error: "Помилка",
        success: "Успіх",
        warning: "Попередження",
        confirm: "Підтвердити",
        cancel: "Скасувати",
        delete: "Видалити",
        edit: "Редагувати",
        save: "Зберегти",
        back: "Назад",
      },
      history: {
        loading: "Завантаження...",
        title: "Історія сесій",
        subtitle: "Детальний клінічний звіт пройдених тренувань та іспитів",
        table_date: "Дата та час",
        table_type: "Тип сесії",
        table_metrics: "Метрики (Rel / MSE)",
        table_score: "Бал",
        table_actions: "Дії",
        mode_exam: "Іспит",
        mode_practice: "Практика",
        diff_hard: "Складний",
        diff_easy: "Легкий",
        diff_medium: "Середній",
        btn_review: "Огляд",
        empty_title: "Історія порожня",
        empty_desc: "Ви ще не пройшли жодного тренування чи іспиту.",
        modal_exam_title: "Деталі Іспиту",
        modal_practice_title: "Деталі Практики",
        images_count: "Кількість знімків",
        images_pcs: "шт.",
        avg_score: "Середній бал",
        review_images: "Перегляд знімків:",
        image_num: "Знімок №{{num}}",
        metric_iou: "Точність (IoU)",
        metric_missed: "Пропущені вогнища",
        metric_false: "Зайві рамки",
        practice_score: "Бал за практику:",
        table_verdict: "Вердикт аналізу",
        verdict_perfect: "Точний аналіз",
        verdict_missed: "Пропущено патологію",
        verdict_hyper: "Гіпердіагностика",
        verdict_satisfactory: "Задовільно",
        exam_success: "Успішний іспит",
        exam_remarks: "Є зауваження",
      },
      admin: {
        subtitle: "Панель управління",
        user_admin: "Адміністратор",
        btn_logout: "Вийти",
        nav_overview: "АНАЛІТИКА",
        nav_management: "КЕРУВАННЯ",
        nav_system: "СИСТЕМА",
        tab_overview: "Огляд",
        tab_users: "Користувачі",
        tab_analyses: "Аналізи",
        tab_dataset: "Датасет",
        tab_settings: "Налаштування",
        mode_exam: "ІСПИТ",
        mode_practice: "ПРАКТИКА",
        diff_easy: "Легко",
        diff_medium: "Середньо",
        diff_hard: "Важко",
        overview: {
          title: "Системний огляд",
          desc: "Статистика використання платформи та останні результати",
          stat_users: "Всього користувачів",
          stat_scans: "Проаналізовано знімків",
          stat_success: "Сер. точність",
          stat_iou: "Активні сесії",
          recent_analyses: "Останні аналізи",
          view_all: "Переглянути всі",
          col_datetime: "Дата та час",
          col_user: "Користувач",
          col_mode: "Режим",
          col_metrics: "Метрики",
          col_score: "Результат",
          col_view: "Дія",
          no_name: "Без імені",
          group_metrics: "Груповий звіт",
          no_data: "Даних поки немає",
          diagnosis_distribution: "Розподіл діагнозів",
          total: "Всього",
          error_load: "Помилка завантаження даних",
        },

        users: {
          title: "Керування користувачами",
          desc: "Список зареєстрованих користувачів та їх активність",
          btn_add: "Додати користувача",
          search_placeholder: "Пошук за ім'ям або email...",
          col_user: "Користувач",
          col_role: "Роль",
          col_reg: "Реєстрація",
          col_analyses: "Аналізи",
          col_score: "Сер. бал",
          col_actions: "Дії",
          role_admin: "Адмін",
          role_user: "Користувач",
          no_name: "Не вказано",
          no_users: "Користувачів не знайдено",
          btn_edit: "Редагувати",
          btn_delete: "Видалити",
          delete_confirm:
            "Ви впевнені, що хочете видалити користувача {{name}}?",
          delete_success: "Користувача видалено",
          delete_error: "Помилка при видаленні",
          save_success: "Дані користувача {{email}} оновлено",
          create_success: "Користувача створено",
          save_error: "Помилка при збереженні",
        },
        dataset: {
          title: "Керування датасетом",
          desc: "Огляд зображень, що використовуються для навчання та тестів",
          stat_images: "Всього зображень",
          stat_labeled: "Розмічено",
          stat_classes: "Кількість класів",
          stat_version: "Версія",
          classes: "Розподіл за класами",
          class_pneumonia: "Пневмонія",
          class_normal: "Норма",
          class_images: "зображень",
          images_in_dataset: "Зображення в системі",
          btn_all: "Показати всі",
          btn_hide: "Згорнути",
          no_images: "Зображення відсутні",
        },
        settings: {
          title: "Налаштування системи",
          desc: "Керування профілем та параметрами інтерфейсу",
          personal_data: "Особисті дані",
          display_name: "Ім'я для відображення",
          btn_save: "Зберегти зміни",
          security: "Безпека",
          new_password: "Новий пароль",
          btn_update_password: "Оновити пароль",
          interface: "Інтерфейс",
          platform_name: "Назва платформи",
          language: "Мова системи",
          btn_logout: "Вийти з акаунту",
          profile_updated: "Профіль оновлено",
          password_updated: "Пароль оновлено",
        },
        modal: {
          reference: "Еталонне зображення",
          exam_review: "Перегляд іспиту",
          practice_review: "Результат практики",
          focal_coordinates: "Координати осередків (ground truth):",
          images_count: "Кількість знімків",
          user: "Користувач",
          average_score: "Середній бал",
          image: "Знімок",
          difficulty: "Складність",
          iou_accuracy: "Точність (IoU)",
          new_user: "Новий користувач",
          edit_user: "Редагувати користувача",
          full_name: "Повне ім'я",
          role: "Роль",
          role_admin: "Адміністратор",
          role_user: "Студент/Користувач",
          btn_create: "Створити",
          btn_save_changes: "Зберегти зміни",
        },
        upload: {
          error_no_file: "Будь ласка, виберіть файл",
          success: "Файл успішно завантажено",
          error: "Помилка завантаження",
        },
        analyses: {
          title: "Журнал аналізів",
          desc: "Детальна історія всіх проведених перевірок та результатів іспитів",
          col_datetime: "Дата та час",
          col_user: "Користувач",
          col_mode: "Режим",
          col_metrics: "Метрики",
          col_score: "Результат",
          col_view: "Перегляд",
          no_name: "Без імені",
          group_metrics: "Груповий звіт",
        },
        // Додайте ці ключі, якщо вони використовуються в таблиці
        metrics: {
          rel: "Rel",
          mse: "MSE",
          iou: "IoU",
        },
        diagnoses: {
          pneumonia: "Пневмонія",
          normal: "Норма",
        },
      },
    },
  },

  en: {
    translation: {
      // ========== HOME PAGE ==========
      home: {
        // --- Головна секція (Hero) ---
        hero_title_1: "Artificial Intelligence",
        hero_title_2: "for pneumonia diagnosis",
        hero_title_highlight: "and your professional growth",
        hero_desc:
          "Upload an X-ray image for analysis or improve your skills with our interactive simulator.",
        btn_diagnosis: "Diagnose Pneumonia",
        btn_more: "Learn More", // Замінив btn_training, оскільки в новому дизайні там "Дізнатися більше"
        ai_active: "AI MODEL ACTIVE",

        // --- Міні-переваги під кнопками ---
        feat_reliable: "Reliable",
        feat_reliable_desc: "High-accuracy AI model",
        feat_educational: "Educational",
        feat_educational_desc: "Interactive cases and feedback",
        feat_effective: "Effective",
        feat_effective_desc: "Improve your skills every day",

        // --- Блок з результатом аналізу (на макеті рентгену) ---
        result_label: "Analysis Result",
        analysis_accuracy: "Probability of pneumonia",

        // --- Інформаційна секція (Що таке пневмонія?) ---
        info_about_title: "What is pneumonia?",
        info_about_desc:
          "Pneumonia is an infectious disease of the lungs that causes inflammation of the lung tissue. Timely diagnosis helps to effectively treat and prevent complications.",
        info_list_1: "Infection of lung tissue",
        info_list_2: "Complicates breathing",
        info_list_3: "May be accompanied by fever and cough",

        // --- Інформаційна секція (Чому це важливо?) ---
        why_important_title: "Why is it important?",
        why_important_desc:
          "Pneumonia is one of the most common causes of hospitalization worldwide. Quick and accurate diagnosis significantly increases the chances of recovery.",
        stat_cases: "pneumonia cases annually worldwide",
        stat_deaths: "deaths annually due to pneumonia",
        stat_survival: "cases can be treated effectively if detected early",

        // --- Як це працює ---
        how_it_works: "How does our platform work?",
        step1_title: "Upload an image",
        step1_desc: "Get a chest X-ray image for analysis.",
        step2_title: "Select area",
        step2_desc: "Manually mark the probable affected area on the image.",
        step3_title: "AI analyzes",
        step3_desc:
          "Our model analyzes the image and compares it with your markup.",
        step4_title: "Get result",
        step4_desc:
          "Find out the accuracy score and recommendations for improvement.",
        step5_title: "Improve skills",
        step5_desc: "Practice on different cases and track your progress.",

        // --- Чому обирають нас ---
        why_choose_title: "Why choose LungAI?",
        benefit_1: "Modern AI models for analyzing X-ray images",
        benefit_2: "Interactive learning with immediate feedback",
        benefit_3: "Real medical cases and different difficulty levels",
        benefit_4: "Detailed statistics and history of your results",
        benefit_5: "Suitable for students, doctors, and medical professionals",

        // --- Наша мета (Картка) ---
        target_title: "Our goal",
        target_desc:
          "To help medical professionals and students master the skills of interpreting X-ray images using artificial intelligence and modern technologies.",
        btn_start_now: "Start now",

        // --- Футер безпеки ---
        security_footer:
          "Your data is secure. We adhere to high standards of security and confidentiality.",
        risk_title: "Pneumonia Risk Factors",
        risk_subtitle:
          "Understanding risk factors helps prevent the disease and protect your health.",
        risk_1_title: "Weakened Immunity",
        risk_1_desc:
          "A weakened immune system increases the risk of bacterial and viral infections.",
        risk_2_title: "Bad Habits",
        risk_2_desc:
          "Damages lung tissue and reduces the protective functions of the respiratory system.",
        risk_3_title: "Chronic Diseases",
        risk_3_desc:
          "COPD, asthma, and heart diseases can complicate the course of pneumonia.",
        risk_4_title: "Age Risk Groups",
        risk_4_desc:
          "Children and the elderly have a higher probability of complications.",
        cta_title: "Ready to improve your diagnostic skills?",
        cta_desc:
          "Join doctors, students, and medical professionals who are already using LungAI for learning and practice.",
        btn_start_analysis: "Start analysis now",
        cta_note: "Free • Registration required",
        footer_desc:
          "AI platform for pneumonia diagnosis and X-ray image learning.",
        contact_us: "Contact Us",
        all_rights: "All rights reserved.",
      },
      // ========== NAVIGATION ==========
      nav: {
        logo: "LungAI",
        home: "Home",
        dashboard: "Dashboard",
        diagnosis: "Diagnosis",
        training: "Simulator",
        profile: "Profile",
        history: "History",
        settings: "Settings",
        logout: "Log Out",
        login: "Log In",
      },
      // ========== AUTHENTICATION ==========
      auth: {
        login_title: "Log In",
        register_title: "Sign Up",
        name_placeholder: "Name",
        email_placeholder: "Email",
        password_placeholder: "Password",
        btn_loading: "Loading...",
        btn_login: "Log In",
        btn_register: "Sign Up",
        switch_to_register: "Create new account",
        switch_to_login: "Already have an account? Log in",
        error_default: "Authentication error",
      },

      dashboard: {
        title: "My Dashboard",
        welcome: "Welcome, {{name}}",
        settings: "Settings",
        language_select: "Interface Language:",
        loading: "Loading...",
        error: "Error",
        retry: "Try Again",
        error_not_logged_in: "User not logged in",

        // Profile Section
        profile: "Profile",
        subtitle: "Personal information and statistics",
        role_admin: "Administrator",
        role_student: "Student",
        pro_account: "Professional Account",
        name_label: "Name:",
        email_label: "Email:",
        reg_date_label: "Registration Date",

        // Stats Section
        stats_title: "Statistics",
        stat_total_sessions: "Total Sessions",
        stat_avg_score: "Average Score",
        stat_success_rate: "Success Rate",
        stat_best_score: "Best Score",

        // Competencies and Skills
        comp_title: "Competency Level",
        comp_no_data: "No Data",
        comp_no_data_desc: "Complete your first training to see your level.",
        comp_high: "Advanced",
        comp_high_desc:
          "You are showing excellent results! Keep up the good work.",
        comp_medium: "Intermediate",
        comp_medium_desc:
          "Good start! Regular practice will help improve accuracy.",
        comp_low: "Beginner",
        comp_low_desc:
          "Analyze your mistakes and study the AI benchmarks closer.",
        comp_level_label: "Level",

        skill_diag: "Pneumonia Diagnosis",
        skill_interp: "Image Interpretation",
        skill_anomaly: "Anomaly Detection",
        skill_accuracy: "Analysis Accuracy",

        tip_title: "Tip of the Day",
        tip_desc:
          "Regular practice with different types of scans helps improve diagnostic accuracy.",

        // History Section
        history: "Training History",
        table_date: "Date",
        table_mode: "Mode",
        table_image: "Image",
        table_result: "Result",
        no_results: "No results yet. Start training!",
        mode_training: "Simulator",
        mode_diagnosis: "Diagnosis",
        custom_image: "Custom Image",
        score_analysis: "Analysis",
      },

      diagnosis: {
        page_title: "Pneumonia Diagnosis",
        step_upload: "Upload",
        step_analyze: "Analysis",
        step_result: "Result",

        upload_title:
          "Drag and drop the image here<br />or click to select a file",
        upload_formats: "Supported formats: PNG, JPG (up to 20MB)",
        btn_choose_file: "Select file",

        preview_title: "Image is ready for analysis",
        preview_desc:
          "The AI model will analyze the image for signs of pneumonia.",
        btn_start_analysis: "Start Analysis",
        btn_choose_other: "Select another file",

        tips_title: "Tips for a quality scan",
        tip1: "Ensure correct patient positioning",
        tip2: "Image should be clear and free of artifacts",
        tip3: "AP (Anteroposterior) and PA (Posteroanterior) projections are supported",
        disclaimer:
          "This service does not replace professional medical consultation.",

        analyzing_title: "Analyzing image...",
        analyzing_desc:
          "This may take a few seconds. The AI is looking for signs of pathologies.",

        result_disclaimer:
          "The result is for reference purposes and is not a definitive diagnosis.",
        btn_save_report: "Save Report",
        results_title: "Analysis Result",

        norm_title: "NORMAL",
        norm_label: "No pathologies detected",
        pneumonia_title: "PNEUMONIA DETECTED",

        zones_detected: "Affected zones detected:",
        found_areas: "Detected Areas",
        area_label: "Affected zone #{{id}}",
        right_lung: "right lung",
        left_lung: "left lung",
        total_area: "Total affected area:",
        no_pathologies: "No pathological changes detected",

        rec_title: "Recommendation",
        rec_pneumonia:
          "Urgent consultation with a pulmonologist and further examination are recommended.",
        rec_normal:
          "The scan is within normal limits. Routine check-up according to schedule is recommended.",
        btn_new_analysis: "New Analysis",

        error_no_file: "Please select a file",
        error_api: "Analysis error: {{message}}",
        sev_title: "Risk Assessment Range",
        sev_normal: "No abnormalities detected",
        sev_mild: "Mild form (initial stage)",
        sev_moderate: "Moderate form",
        sev_severe: "Severe form (high risk)",
        rec_borderline:
          "Indicator in the 'gray zone'. No clear signs of pneumonia, but minor abnormalities or shadows are present. Observation and medical consultation are recommended if symptoms (cough, fever) occur.",
        probability: "Probability of pathology:",
      },

      training: {
        title: "Simulator",
        practice_tab: "Practice",
        exam_tab: "Exam",

        diff_select_title: "Select Difficulty",
        diff_select_desc:
          "Choose a difficulty level to start training. The system will automatically select random images from the database.",

        diff_easy_title: "Easy Level",
        diff_easy_desc:
          "Obvious pathologies and completely healthy scans. Ideal for warming up and basic learning.",
        diff_medium_title: "Medium Level",
        diff_medium_desc:
          "Typical clinical cases. Bilateral inflammation, less pronounced shadows, and mixed diagnoses.",
        diff_hard_title: "Hard Level",
        diff_hard_desc:
          "Atypical, faintly expressed, and hidden pathologies. A real challenge for experienced specialists.",
        btn_start_practice: "Start Practice",

        exam_title: "Exam Simulation",
        exam_desc:
          "15 images, a strict timer (30 sec/image), and blind verification. Feedback and scores are provided only after completing all tasks.",
        btn_start_exam: "Start Exam",

        btn_interrupt_exam: "Interrupt Exam",
        back_btn: "Back to menu",
        exam_progress: "Image {{current}} of {{total}}",
        mode_practice: "Mode: Practice",

        loading: "Analyzing...",
        boxes_drawn: "Zones found: {{count}}",
        instruction_drag:
          "Hold the left mouse button to highlight the inflammation",
        btn_clear: "Clear",
        btn_normal: "Healthy (Normal)",
        btn_check: "Check",
        btn_submit_exam: "Submit",

        result_title: "Analysis Result",
        diff_easy: "Easy",
        diff_medium: "Medium",
        diff_hard: "Hard",

        feedback_correct_no_pneumonia: "Perfect! No pathologies detected.",
        feedback_false_positive_healthy:
          "Warning! Highlighted {{count}} false zones on a healthy scan.",
        feedback_critical_miss:
          "Critical error: missed {{count}} inflammation zones.",

        metric_area_error: "Relative Area Error",
        metric_mse: "Mean Squared Error (MSE)",
        metric_iou: "Localization Accuracy (IoU)",
        correct_boxes: "AI Standard (Green)",
        btn_next: "Next Random Image",

        exam_report_title: "Exam Results Report",
        stats_images: "Images",
        stats_missed: "Missed",
        stats_false: "False Boxes",
        exam_details_title: "Detailed Image Analysis:",
        image_number: "Image #{{id}}",
        metric_rel_short: "Rel. Error:",
        metric_mse_short: "MSE:",
        score_label: "Score:",
        btn_new_exam: "Start New Exam",
        btn_back_menu: "Back to Menu",

        error_no_images_level:
          "No images with level '{{level}}' currently in the database.",
        error_load: "Error loading image: {{message}}",
        error_exam_loading: "Loading exam database... Try again in a moment.",
        error_check: "Check error: {{message}}",

        recommendations: {
          title: "💡 AI Recommendation:",
          excellent:
            "Excellent work! Your diagnostic skills are at the highest level. Keep it up.",
          overdiagnosis:
            "You have many false positives (overdiagnosis). You tend to see pathology where there is none. Pay closer attention to 'Normal' scans.",
          underdiagnosis:
            "You are missing many existing pathologies. Focus on finding small and faintly expressed focal points.",
          precision:
            "You find the inflammation, but your boxes are inaccurate (high area error). Try to draw the pathology boundaries more tightly.",
          hard_practice:
            "We recommend training in free practice on the 'Hard' level to improve your attention.",
          general:
            "We recommend training more in free practice to consolidate your skills.",
        },
      },

      settings: {
        title: "Settings",
        subtitle: "Manage your account and preferences",
        role_admin: "Administrator",
        role_student: "Student / Doctor",

        account_title: "Account",
        fullname_label: "Full Name",
        email_label: "Email",
        role_label: "Specialty (Role)",
        role_hint: "* Only an administrator can change roles",
        saving: "Saving...",
        save_changes: "Save Changes",

        system_title: "System Preferences",
        language_label: "Interface Language",
        theme_label: "Theme",
        theme_light: "Light Theme",
        theme_dark: "Dark Theme",

        password_title: "Change Password",
        current_password: "Current Password",
        new_password: "New Password",
        confirm_password: "Confirm New Password",
        change_password_btn: "Change Password",

        danger_zone_title: "Danger Zone",
        logout_title: "Log Out",
        logout_desc: "End the current session on this device.",
        logout_btn: "Log Out",
        delete_account_title: "Delete Account",
        delete_account_desc: "This action cannot be undone.",
        delete_btn: "Delete",

        // Toasts
        msg_profile_success: "Profile updated successfully!",
        msg_profile_error: "Update error",
        msg_pwd_mismatch: "New passwords do not match",
        msg_pwd_success: "Password changed successfully!",
        msg_pwd_error: "Error changing password",
      },

      // ========== COMMON MESSAGES ==========
      common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        confirm: "Confirm",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        save: "Save",
        back: "Back",
      },
      history: {
        loading: "Loading...",
        title: "Session History",
        subtitle: "Detailed clinical report of completed practices and exams",
        table_date: "Date & Time",
        table_type: "Session Type",
        table_metrics: "Metrics (Rel / MSE)",
        table_score: "Score",
        table_actions: "Actions",
        mode_exam: "Exam",
        mode_practice: "Practice",
        diff_hard: "Hard",
        diff_easy: "Easy",
        diff_medium: "Medium",
        btn_review: "Review",
        empty_title: "History is empty",
        empty_desc: "You haven't completed any training or exams yet.",
        modal_exam_title: "Exam Details",
        modal_practice_title: "Practice Details",
        images_count: "Number of images",
        images_pcs: "pcs.",
        avg_score: "Average Score",
        review_images: "View Images:",
        image_num: "Image №{{num}}",
        metric_iou: "Accuracy (IoU)",
        metric_missed: "Missed Areas",
        metric_false: "False Boxes",
        practice_score: "Practice Score:",
        table_verdict: "Analysis Verdict",
        verdict_perfect: "Accurate Analysis",
        verdict_missed: "Pathology Missed",
        verdict_hyper: "Overdiagnosis",
        verdict_satisfactory: "Satisfactory",
        exam_success: "Exam Passed",
        exam_remarks: "Has Remarks",
      },
      admin: {
        subtitle: "Management Panel",
        user_admin: "Адміністратор",
        btn_logout: "Logout",
        nav_overview: "ANALYTICS",
        nav_management: "MANAGEMENT",
        nav_system: "SYSTEM",
        tab_overview: "Overview",
        tab_users: "Users",
        tab_analyses: "Analyses",
        tab_dataset: "Dataset",
        tab_settings: "Settings",
        mode_exam: "EXAM",
        mode_practice: "PRACTICE",
        diff_easy: "Easy",
        diff_medium: "Medium",
        diff_hard: "Hard",
        overview: {
          title: "System Overview",
          desc: "Platform usage statistics and recent results",
          stat_users: "Total Users",
          stat_scans: "Total Scans",
          stat_success: "Avg. Accuracy",
          stat_iou: "Active Sessions",
          recent_analyses: "Recent Analyses",
          view_all: "View All",
          col_datetime: "Date & Time",
          col_user: "User",
          col_mode: "Mode",
          col_metrics: "Metrics",
          col_score: "Score",
          col_view: "Action",
          no_name: "No name",
          group_metrics: "Group Report",
          no_data: "No data available yet",
          diagnosis_distribution: "Diagnosis Distribution",
          total: "Total",
          error_load: "Error loading data",
        },
        users: {
          title: "User Management",
          desc: "List of registered users and their activity",
          btn_add: "Add User",
          search_placeholder: "Search by name or email...",
          col_user: "User",
          col_role: "Role",
          col_reg: "Registration",
          col_analyses: "Analyses",
          col_score: "Avg Score",
          col_actions: "Actions",
          role_admin: "Admin",
          role_user: "User",
          no_name: "Not specified",
          no_users: "No users found",
          btn_edit: "Edit",
          btn_delete: "Delete",
          delete_confirm: "Are you sure you want to delete user {{name}}?",
          delete_success: "User deleted",
          delete_error: "Deletion error",
          save_success: "User {{email}} updated",
          create_success: "User created",
          save_error: "Save error",
        },
        dataset: {
          title: "Dataset Management",
          desc: "Overview of images used for training and testing",
          stat_images: "Total Images",
          stat_labeled: "Labeled",
          stat_classes: "Classes Count",
          stat_version: "Version",
          classes: "Class Distribution",
          class_pneumonia: "Pneumonia",
          class_normal: "Normal",
          class_images: "images",
          images_in_dataset: "Images in Dataset",
          btn_all: "Show All",
          btn_hide: "Collapse",
          no_images: "No images found",
        },
        settings: {
          title: "System Settings",
          desc: "Manage profile and interface parameters",
          personal_data: "Personal Data",
          display_name: "Display Name",
          btn_save: "Save Changes",
          security: "Security",
          new_password: "New Password",
          btn_update_password: "Update Password",
          interface: "Interface",
          platform_name: "Platform Name",
          language: "System Language",
          btn_logout: "Log Out",
          profile_updated: "Profile updated",
          password_updated: "Password updated",
        },
        modal: {
          reference: "Reference Image",
          exam_review: "Exam Review",
          practice_review: "Practice Result",
          focal_coordinates: "Ground truth coordinates:",
          images_count: "Images count",
          user: "User",
          average_score: "Average Score",
          image: "Image",
          difficulty: "Difficulty",
          iou_accuracy: "IoU Accuracy",
          new_user: "New User",
          edit_user: "Edit User",
          full_name: "Full Name",
          role: "Role",
          role_admin: "Адміністратор",
          role_user: "Student/User",
          btn_create: "Create",
          btn_save_changes: "Save Changes",
        },
        upload: {
          error_no_file: "Please select a file",
          success: "File uploaded successfully",
          error: "Upload error",
        },
        analyses: {
          title: "Analyses Log",
          desc: "Detailed history of all conducted checks and exam results",
          col_datetime: "Date & Time",
          col_user: "User",
          col_mode: "Mode",
          col_metrics: "Metrics",
          col_score: "Score",
          col_view: "View",
          no_name: "No name",
          group_metrics: "Group metrics",
        },
        metrics: {
          rel: "Rel",
          mse: "MSE",
          iou: "IoU",
        },
        diagnoses: {
          pneumonia: "Pneumonia",
          normal: "Normal",
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("app_language") || "uk",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
