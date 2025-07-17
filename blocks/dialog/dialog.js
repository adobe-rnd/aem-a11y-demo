import { toClassName } from '../../scripts/aem.js';
import { getRandomId, decorateInlineIcon } from '../../scripts/a11y-core.js';

let dialogsInitialized = false;

function decorateButtons(footer, dialog) {
  const paragraphs = footer.querySelectorAll('p');
  if (paragraphs.length === 0) return;

  const buttonWrapper = paragraphs[0].parentElement;
  if (buttonWrapper) {
    buttonWrapper.classList.add('dialog-button-wrapper');
  }

  paragraphs.forEach((p) => {
    const button = document.createElement('button');
    button.className = 'button dialog-button';
    const strong = p.querySelector('strong');
    const em = p.querySelector('em');

    if (strong) {
      button.classList.add('primary');
      button.innerHTML = strong.innerHTML;
    } else if (em) {
      button.classList.add('secondary');
      button.innerHTML = em.innerHTML;
    } else {
      button.innerHTML = p.innerHTML;
    }

    button.addEventListener('click', () => {
      const returnValue = toClassName(button.textContent.trim());
      dialog.returnValue = returnValue;
      dialog.close(returnValue);
    });

    p.replaceWith(button);
  });
}

function initDialogTriggers() {
  const dialogs = document.querySelectorAll('.dialog');
  dialogs.forEach((dialog) => {
    const id = dialog.querySelector('dialog')?.id;
    const triggers = document.querySelectorAll(`a[href="#${id}"]`);

    triggers.forEach((trigger) => {
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
    });
  });

  if (dialogsInitialized) return;
  dialogsInitialized = true;

  document.body.addEventListener('click', (e) => {
    const trigger = e.target.closest('a[href^="#"]');
    if (!trigger) return;

    const dialog = document.querySelector(trigger.hash);
    if (dialog && dialog.tagName === 'DIALOG') {
      e.preventDefault();
      if (dialog.hasAttribute('data-modal')) {
        dialog.showModal();
      } else {
        dialog.show();
      }
      dialog.querySelector('footer button')?.focus();
      // eslint-disable-next-line no-underscore-dangle
      dialog._opener = trigger;
    }
  });

  const { hash } = window.location;
  if (hash) {
    try {
      const dialog = document.querySelector(hash);
      if (dialog && dialog.tagName === 'DIALOG') {
        if (dialog.hasAttribute('data-modal')) {
          dialog.showModal();
        } else {
          dialog.show();
        }
        dialog.querySelector('footer button')?.focus();
      }
    } catch (e) {
      // Ignore invalid selectors
    }
  }
}

export default async function decorate(block) {
  const isModal = block.classList.contains('modal');
  const rows = [...block.querySelectorAll(':scope > div')];
  const container = document.createElement('div');
  container.className = 'dialog-container';

  let idRow;
  let titleRow;
  let contentRow;
  let footerRow;

  const firstRowHeading = rows[0]?.querySelector('h1, h2, h3, h4, h5, h6');
  if (rows.length >= 3 && !firstRowHeading) {
    [idRow, titleRow, contentRow, footerRow] = rows;
  } else {
    [titleRow, contentRow, footerRow] = rows;
  }

  const header = document.createElement('div');
  header.className = 'dialog-header';

  const dialog = document.createElement('dialog');

  const alertTypes = ['info', 'warning', 'error', 'success'];
  const variantType = alertTypes.find((type) => block.classList.contains(type));
  if (variantType) {
    dialog.classList.add(variantType);
    const iconSpan = document.createElement('span');
    iconSpan.className = `icon icon-${variantType}`;
    header.append(iconSpan);
    decorateInlineIcon(iconSpan);
  }

  if (variantType) {
    const titlePrefix = document.createElement('span');
    titlePrefix.className = 'dialog-type';
    titlePrefix.textContent = `${variantType.charAt(0).toUpperCase() + variantType.slice(1)}: `;
    header.append(titlePrefix);
  }

  const heading = titleRow.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    dialog.setAttribute('aria-labelledby', heading.id);
  }

  const title = document.createElement('div');
  title.className = 'dialog-title';
  title.append(...titleRow.children[0].children);
  header.append(title);

  if (idRow) {
    dialog.id = toClassName(idRow.textContent.trim());
    idRow.remove();
  } else if (heading) {
    dialog.id = `${heading.id}-dialog`;
  } else {
    dialog.id = getRandomId('dialog');
  }

  const closeButton = document.createElement('button');
  closeButton.className = 'button secondary dialog-close';
  closeButton.setAttribute('aria-label', 'Close');
  header.append(closeButton);

  container.append(header);
  titleRow.remove();

  const content = document.createElement('div');
  content.className = 'dialog-content';
  content.append(...contentRow.children);
  content.id = getRandomId('dialog-content');
  // content.tabIndex = 0;
  dialog.setAttribute('aria-describedby', content.id);
  container.append(content);
  contentRow.remove();

  if (footerRow) {
    const footer = document.createElement('div');
    footer.className = 'dialog-footer';
    footer.append(...footerRow.children);
    decorateButtons(footer, dialog);
    container.append(footer);
    footerRow.remove();
  }

  if (isModal) {
    dialog.dataset.modal = 'true';
  }

  dialog.append(container);

  closeButton.addEventListener('click', () => {
    dialog.returnValue = 'close';
    dialog.close();
    // eslint-disable-next-line no-underscore-dangle
    dialog._opener?.focus();
  });

  block.innerHTML = '';
  block.append(dialog);

  initDialogTriggers();
}

/**
 * Resets the dialog initialization flag for testing purposes.
 * @private
 */
// eslint-disable-next-line no-underscore-dangle
export function _reset() {
  dialogsInitialized = false;
}
