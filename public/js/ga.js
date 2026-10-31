// GA4 configuration, kept out of the page so that no script has to run inline.
// The measurement ID arrives on this script's own data-ga-id attribute.
(function () {
  var id = document.currentScript && document.currentScript.getAttribute("data-ga-id");
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  // No Google signals or ad personalisation: this site shows no ads, and with
  // them on, gtag reaches advertising hosts the page's policy does not allow.
  window.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });
})();
