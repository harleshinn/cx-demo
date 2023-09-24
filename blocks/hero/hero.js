export default function decorate(block) {
  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('hero-img-col');
        }
      }

      const content = row.querySelector('div');
      if (content) {
        const contentWrapper = content.closest('div');
        contentWrapper.classList.add('hero-content-col');
      }
    });
  });
}
