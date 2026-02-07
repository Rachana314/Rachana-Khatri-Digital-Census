import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [voiceNav, setVoiceNav] = useState(false);
  const [screenReader, setScreenReader] = useState(true);

  const current = i18n.language?.startsWith("np") ? "np" : "en";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{t("settings.title")}</h1>
        <p className="text-black/60 font-medium mt-1">{t("settings.subtitle")}</p>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-6">
        {/* Language */}
        <div>
          <div className="font-extrabold text-lg">{t("common.language")}</div>
          <p className="text-black/60 font-medium mt-1">{t("settings.chooseLanguage")}</p>

          <select
            value={current}
            onChange={(e) => {
              const lng = e.target.value; // en | np
              i18n.changeLanguage(lng);
              localStorage.setItem("app_lang", lng); // keep it on refresh
            }}
            className="mt-3 rounded-2xl border p-3 w-full sm:w-72"
          >
            <option value="en">{t("common.english")}</option>
            <option value="np">{t("common.nepali")}</option>
          </select>
        </div>

        {/* Accessibility */}
        <div className="pt-6 border-t space-y-4">
          <div>
            <div className="font-extrabold text-lg">{t("settings.accessibility")}</div>
            <p className="text-black/60 font-medium mt-1">{t("settings.accessibilityDesc")}</p>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border p-4">
            <div>
              <div className="font-extrabold">{t("settings.voiceNav")}</div>
              <div className="text-black/60 font-medium text-sm">{t("settings.voiceNavDesc")}</div>
            </div>
            <input type="checkbox" checked={voiceNav} onChange={(e) => setVoiceNav(e.target.checked)} />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-2xl border p-4">
            <div>
              <div className="font-extrabold">{t("settings.screenReader")}</div>
              <div className="text-black/60 font-medium text-sm">{t("settings.screenReaderDesc")}</div>
            </div>
            <input type="checkbox" checked={screenReader} onChange={(e) => setScreenReader(e.target.checked)} />
          </label>

          <button
            onClick={() => alert(t("settings.saved"))}
            className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition"
          >
            {t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
