export class SortPaints {
  sort(products, order='asc') {
    throw new Error('Sort method should be implemented!');
  }
}

export class SortPaintsByField extends SortPaints {
  constructor(field) {
    super();
    this.field = field;
  }

  sort(products, order = 'asc') {
    if (!Array.isArray(products)) {
      throw new Error('Expected an array');
    }

    const paints = products.map(product => ({ ...product }));

    if (order === 'asc') {
      return paints.sort((a, b) => a[this.field] - b[this.field]);
    } else if (order === 'desc') {
      return paints.sort((a, b) => b[this.field] - a[this.field]);
    } else {
      throw new Error('Invalid sort order');
    }
  }
}
