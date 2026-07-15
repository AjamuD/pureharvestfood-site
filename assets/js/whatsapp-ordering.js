(function () {
  "use strict";

  var phone = "18683618990";
  var actionPattern = /add to cart|proceed to checkout|^checkout$|order on whatsapp/i;

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function productName(action) {
    var container = action.closest("article, .cart-item, [class*='card'], .bg-white");
    var heading = container && container.querySelector("h1, h2, h3, h4");
    return heading ? cleanText(heading.textContent) : "";
  }

  function cartSummary() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".cart-item"));
    var names = items.map(function (item) {
      var heading = item.querySelector("h2, h3, h4");
      var quantity = item.querySelector("input[type='number']");
      if (!heading) return "";
      return "- " + cleanText(heading.textContent) + (quantity ? " (quantity " + quantity.value + ")" : "");
    }).filter(Boolean);
    return names.length ? "\n\nItems shown in my cart:\n" + names.join("\n") : "";
  }

  function messageFor(action) {
    var name = productName(action);
    var message = "Hello Pure Harvest, I would like to place an order";
    if (name) message += " for " + name;
    message += ". Please confirm the current price and availability.";
    if (action.id === "checkout-btn") message += cartSummary();
    return message;
  }

  function whatsappUrl(action) {
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(messageFor(action));
  }

  function prepareActions() {
    document.querySelectorAll("button, a").forEach(function (action) {
      if (!actionPattern.test(cleanText(action.textContent))) return;
      action.setAttribute("data-whatsapp-order", "true");
      action.setAttribute("aria-label", "Order on WhatsApp");
      action.innerHTML = '<i class="ri-whatsapp-line mr-2"></i> Order on WhatsApp';
      if (action.tagName === "A") {
        action.href = whatsappUrl(action);
        action.target = "_blank";
        action.rel = "noopener noreferrer";
      }
    });
  }

  document.addEventListener("click", function (event) {
    var action = event.target.closest("[data-whatsapp-order='true']");
    if (!action) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.open(whatsappUrl(action), "_blank", "noopener,noreferrer");
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prepareActions);
  } else {
    prepareActions();
  }
}());
