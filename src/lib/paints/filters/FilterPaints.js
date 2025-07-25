class FilterPaints {
  filter(paints, criteria) {
    throw new Error('Filter method should be implemented!');
  }
}


export class  FilterPaintsByFields extends FilterPaints{
  
  filter(paints, stateFields) {
    const filtered =  paints.filter(paint => {
      let validPaint = true;
      for (const key in stateFields) {
        if (Object.hasOwnProperty.call(stateFields, key)) {
      
          if(paint[key] !== stateFields[key]) {
            validPaint = false;
            break;

          }
          
        }
      }
      return validPaint

    });
  
    return filtered;
  }
}
