/* eslint-disable no-unused-expressions */
import {
  html,
  fixture,
  expect,
} from '@open-wc/testing';
import decorate from '../../blocks/breadcrumb/breadcrumb.js';

describe('Breadcrumb Block', () => {
  it('decorates a standard breadcrumb list', async () => {
    const element = await fixture(html`
      <div class="breadcrumb">
        <div>
          <div>
            <ul>
              <li><a href="/link1">Home</a></li>
              <li><a href="/link2">Category</a></li>
              <li>Current Page</li>
            </ul>
          </div>
        </div>
      </div>
    `);
    decorate(element);

    const nav = element.querySelector('nav');
    expect(nav).to.exist;
    expect(nav.getAttribute('aria-label')).to.equal('breadcrumb');

    const ol = element.querySelector('ol');
    expect(ol).to.exist;

    const items = element.querySelectorAll('li');
    expect(items.length).to.equal(3);

    // Check current page
    expect(items[2].getAttribute('aria-current')).to.equal('page');
  });

  it('handles a breadcrumb with only one item', async () => {
    const element = await fixture(html`
      <div class="breadcrumb">
        <div>
          <div>
            <ul>
              <li>Homepage</li>
            </ul>
          </div>
        </div>
      </div>
    `);
    decorate(element);
    const nav = element.querySelector('nav');
    expect(nav).to.exist;
    const items = element.querySelectorAll('li');
    expect(items.length).to.equal(1);
    expect(items[0].getAttribute('aria-current')).to.equal('page');
  });

  it('does not add aria-current if the last item is a link', async () => {
    const element = await fixture(html`
      <div class="breadcrumb">
        <div>
          <div>
            <ul>
              <li><a href="/link1">Home</a></li>
              <li><a href="/link2">Category</a></li>
            </ul>
          </div>
        </div>
      </div>
    `);
    decorate(element);
    const lastItem = element.querySelectorAll('li')[1];
    expect(lastItem.getAttribute('aria-current')).to.be.null;
  });

  it('correctly decorates a breadcrumb from an ordered list (ol)', async () => {
    const element = await fixture(html`
      <div class="breadcrumb">
        <div>
          <div>
            <ol>
              <li><a href="/link1">Home</a></li>
              <li>Current Page</li>
            </ol>
          </div>
        </div>
      </div>
    `);
    decorate(element);
    const nav = element.querySelector('nav');
    expect(nav).to.exist;
    const lastItem = element.querySelectorAll('li')[1];
    expect(lastItem.getAttribute('aria-current')).to.equal('page');
  });

  it('does nothing if no ul is found', async () => {
    const element = await fixture(html`
      <div class="breadcrumb">
        <div>
          <div>
            <div>Some other content</div>
          </div>
        </div>
      </div>
    `);
    const originalHTML = element.innerHTML;
    decorate(element);
    expect(element.innerHTML).to.equal(originalHTML);
  });
});
