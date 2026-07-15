(function () {
  'use strict';

  var endpoint = window.PURE_HARVEST_INVENTORY_ENDPOINT || '';
  var allowedStatuses = {
    'In Stock': 'in-stock',
    'Low Stock': 'low-stock',
    'Out of Stock': 'out-of-stock'
  };
  var productNames = {
    'garlic-powder': 'Garlic Powder',
    'dehydrated-bay-leaves': 'Dehydrated Bay Leaves',
    'local-hot-pepper-powder': 'Local Hot Pepper Powder',
    'pimento-power': 'Pimento Power',
    'spicy-pimento-power': 'Spicy Pimento Power'
  };

  function updateCard(product) {
    var cards = document.querySelectorAll('.product-card');
    var productName = productNames[product.key];

    if (!productName) {
      return;
    }

    Array.prototype.forEach.call(cards, function (card) {
      var title = card.querySelector('h3');
      var indicator = card.querySelector('.stock-indicator');
      var inventoryKey = card.getAttribute('data-inventory-key');

      if (!indicator || (inventoryKey !== product.key && (!title || title.textContent.trim() !== productName))) {
        return;
      }

      var statusClass = allowedStatuses[product.status];
      if (!statusClass) {
        return;
      }

      indicator.classList.remove('in-stock', 'low-stock', 'out-of-stock');
      indicator.classList.add(statusClass);

      var statusContainer = indicator.parentElement;
      Array.prototype.forEach.call(statusContainer.childNodes, function (node) {
        if (node.nodeType === 3 && node.textContent.trim()) {
          node.textContent = '\n' + product.status + '\n';
        }
      });
    });
  }

  window.PureHarvestInventory = {
    receive: function (payload) {
      if (!payload || !Array.isArray(payload.products)) {
        return;
      }

      payload.products.forEach(updateCard);
    }
  };

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
    return;
  }

  function requestInventory() {
    var feedScript = document.createElement('script');
    feedScript.src = endpoint + '?callback=PureHarvestInventory.receive&t=' + Date.now();
    feedScript.async = true;
    feedScript.onload = feedScript.onerror = function () {
      feedScript.remove();
    };
    document.head.appendChild(feedScript);
  }

  requestInventory();
  window.setInterval(requestInventory, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      requestInventory();
    }
  });
})();
