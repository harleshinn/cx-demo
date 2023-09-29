/**
 * decorates the form block
 * @param {Element} block The form block element
 */
export default async function decorate(block) {
  const marketoForm = '<form id="mktoForm_1002"></form>';
  const formContainer = document.querySelector('.form-subscribe div > div:nth-child(2)');
  [...block.children].forEach((row) => {
    row.classList.add('form-subscribe__wrapper');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('form-subscribe__asset');
        }
      }
    });
  });
  formContainer.classList.add('form-subscribe__form');
  formContainer.insertAdjacentHTML('beforeend', marketoForm);

  // Custom Form Validation
  // eslint-disable-next-line no-undef
  MktoForms2.whenRendered((form) => {
    const formEl = form.getFormElem()[0].querySelectorAll('.mktoRequiredField');
    formEl.forEach((field) => {
      field.addEventListener('blur', () => {
        form.validate();
      });
    });
  });
}
