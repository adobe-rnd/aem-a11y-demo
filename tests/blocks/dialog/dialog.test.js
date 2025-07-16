/* eslint-disable no-unused-expressions */
import { html, fixture, expect } from '@open-wc/testing';
import { buildBlock } from '../../../scripts/aem.js';
import decorate, { _reset as resetDialogs } from '../../../blocks/dialog/dialog.js';
import { stubMethod, unstubMethod } from '../../test-helpers.js';

const plainFixture = html`
  <div>
    <div class="dialog">
      <div><div>my-dialog</div></div>
      <div><div><h2 id="dialog-title">Plain Dialog</h2></div></div>
      <div><div><p>This is a plain dialog.</p></div></div>
      <div>
        <div>
          <p><em><a href="#">Cancel</a></em></p>
          <p><strong><a href="#">OK</a></strong></p>
        </div>
      </div>
    </div>
    <p><a href="#my-dialog">Open Plain Dialog</a></p>
  </div>
`;

const modalFixture = html`
  <div>
    <div class="dialog modal">
      <div><div>my-modal-dialog</div></div>
      <div><div><h2 id="dialog-title">Modal Dialog</h2></div></div>
      <div><div><p>This is a modal dialog.</p></div></div>
      <div><div><p><strong><a href="#">OK</a></strong></p></div></div>
    </div>
    <p><a href="#my-modal-dialog">Open Modal Dialog</a></p>
  </div>
`;

const infoFixture = html`
  <div>
    <div class="dialog info">
      <div><div>my-info-dialog</div></div>
      <div><div><h2 id="dialog-title">Info Dialog</h2></div></div>
      <div><div><p>This is an informational dialog.</p></div></div>
      <div><div><p><strong><a href="#">OK</a></strong></p></div></div>
    </div>
    <p><a href="#my-info-dialog">Open Info Dialog</a></p>
  </div>
`;

const implicitIdFixture = html`
  <div>
    <div class="dialog">
      <div><div><h2 id="dialog-title">Implicit ID Dialog</h2></div></div>
      <div><div><p>This dialog should get its ID from the heading.</p></div></div>
      <div><div><p><strong><a href="#">OK</a></strong></p></div></div>
    </div>
  </div>
`;

describe('Block: Dialog', () => {
  beforeEach(() => {
    stubMethod(window.HTMLDialogElement.prototype, 'showModal', function showModal() {
      this.setAttribute('open', '');
    });
    stubMethod(window.HTMLDialogElement.prototype, 'close', function close() {
      this.removeAttribute('open');
    });
  });

  afterEach(() => {
    unstubMethod(window.HTMLDialogElement.prototype, 'showModal');
    unstubMethod(window.HTMLDialogElement.prototype, 'close');
    window.location.hash = '';
    resetDialogs();
  });

  it('should render a dialog element', async () => {
    const el = await fixture(plainFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('dialog');
    expect(dialog).to.exist;
    expect(dialog.id).to.equal('my-dialog');
    expect(dialog.getAttribute('aria-labelledby')).to.equal('dialog-title');
  });

  it('should generate an ID from the heading if none is provided', async () => {
    const el = await fixture(implicitIdFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('dialog');
    expect(dialog).to.exist;
    expect(dialog.id).to.equal('dialog-title-dialog');
  });

  it('should open when a trigger link is clicked', async () => {
    const el = await fixture(plainFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('#my-dialog');
    const trigger = el.querySelector('a[href="#my-dialog"]');

    expect(dialog.hasAttribute('open')).to.be.false;
    trigger.click();
    expect(dialog.hasAttribute('open')).to.be.true;
  });

  it('should be a modal dialog if class is set', async () => {
    const el = await fixture(modalFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('#my-modal-dialog');
    expect(dialog.dataset.modal).to.equal('true');
    const trigger = el.querySelector('a[href="#my-modal-dialog"]');
    trigger.click();
    expect(dialog.hasAttribute('open')).to.be.true;
  });

  it('should close when the close button is clicked', async () => {
    const el = await fixture(plainFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('#my-dialog');
    dialog.show();
    expect(dialog.hasAttribute('open')).to.be.true;
    const closeButton = dialog.querySelector('.dialog-close');
    closeButton.click();
    expect(dialog.hasAttribute('open')).to.be.false;
  });

  it('should close when a footer button is clicked', async () => {
    const el = await fixture(plainFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('#my-dialog');
    dialog.show();
    const footerButton = dialog.querySelector('.dialog-footer .dialog-button.primary');
    expect(footerButton).to.exist;
    footerButton.click();
    expect(dialog.hasAttribute('open')).to.be.false;
  });

  it('should add alert class to dialog element', async () => {
    const el = await fixture(infoFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('#my-info-dialog');
    expect(dialog.classList.contains('info')).to.be.true;
  });

  it('should open from a URL hash for plain dialog', async () => {
    window.location.hash = '#my-dialog';
    const el = await fixture(plainFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('#my-dialog');
    expect(dialog.hasAttribute('open')).to.be.true;
  });

  it('should open from a URL hash for modal dialog', async () => {
    window.location.hash = '#my-modal-dialog';
    const el = await fixture(modalFixture);
    await decorate(el.querySelector('.dialog'));
    const dialog = el.querySelector('#my-modal-dialog');
    expect(dialog.hasAttribute('open')).to.be.true;
  });

  describe('Programmatic Creation', () => {
    it('should create a dialog from a JS object using buildBlock', async () => {
      const el = await fixture(html`<div></div>`);
      const dialogContent = [
        ['my-programmatic-dialog'],
        ['<h2>Programmatic Dialog</h2>'],
        ['<p>This was created by JS!</p>'],
        ['<p><strong><a href="#">Confirm</a></strong></p>'],
      ];
      const block = buildBlock('dialog', dialogContent);
      el.append(block);
      await decorate(block);

      const dialog = el.querySelector('dialog');
      expect(dialog).to.exist;
      expect(dialog.id).to.equal('my-programmatic-dialog');
      const h2 = dialog.querySelector('h2');
      expect(h2.textContent).to.equal('Programmatic Dialog');
      const button = dialog.querySelector('.dialog-button.primary');
      expect(button).to.exist;
      expect(button.textContent).to.equal('Confirm');
    });
  });
});
