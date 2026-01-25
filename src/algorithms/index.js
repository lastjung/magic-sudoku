export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const bubbleSort = async (array, onStep) => {
  let arr = [...array];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      await onStep(arr, [j, j + 1], 'compare');
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        await onStep(arr, [j, j + 1], 'swap');
      }
    }
  }
  return arr;
};

export const selectionSort = async (array, onStep) => {
  let arr = [...array];
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      await onStep(arr, [minIdx, j], 'compare');
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      await onStep(arr, [i, minIdx], 'swap');
    }
  }
  return arr;
};

export const insertionSort = async (array, onStep) => {
  let arr = [...array];
  for (let i = 1; i < arr.length; i++) {
    for (let j = i - 1; j >= 0; j--) {
      await onStep(arr, [j, j + 1], 'compare');
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        await onStep(arr, [j, j + 1], 'swap');
      } else {
        break;
      }
    }
  }
  return arr;
};

export const quickSort = async (array, onStep) => {
  let arr = [...array];
  
  const partition = async (low, high) => {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      await onStep(arr, [j, high], 'compare');
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        await onStep(arr, [i, j], 'swap');
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    await onStep(arr, [i + 1, high], 'swap');
    return i + 1;
  };

  const sort = async (low, high) => {
    if (low < high) {
      let pi = await partition(low, high);
      await sort(low, pi - 1);
      await sort(pi + 1, high);
    }
  };

  await sort(0, arr.length - 1);
  return arr;
};

export const mergeSort = async (array, onStep) => {
  let arr = [...array];

  const merge = async (l, m, r) => {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = arr.slice(l, m + 1);
    let R = arr.slice(m + 1, r + 1);

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
      await onStep(arr, [l + i, m + 1 + j], 'compare');
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      await onStep(arr, [k], 'swap');
      k++;
    }

    while (i < n1) {
      arr[k] = L[i];
      await onStep(arr, [k], 'swap');
      i++;
      k++;
    }
    while (j < n2) {
      arr[k] = R[j];
      await onStep(arr, [k], 'swap');
      j++;
      k++;
    }
  };

  const sort = async (l, r) => {
    if (l < r) {
      let m = Math.floor((l + r) / 2);
      await sort(l, m);
      await sort(m + 1, r);
      await merge(l, m, r);
    }
  };

  await sort(0, arr.length - 1);
  return arr;
};

// Heap Sort
export const heapSort = async (array, onStep) => {
  let arr = [...array];
  const n = arr.length;

  const heapify = async (n, i) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      await onStep(arr, [largest, left], 'compare');
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < n) {
      await onStep(arr, [largest, right], 'compare');
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      await onStep(arr, [i, largest], 'swap');
      await heapify(n, largest);
    }
  };

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    await onStep(arr, [0, i], 'swap');
    await heapify(i, 0);
  }

  return arr;
};

// Shell Sort
export const shellSort = async (array, onStep) => {
  let arr = [...array];
  const n = arr.length;

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j = i;

      await onStep(arr, [j, j - gap], 'compare');
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        await onStep(arr, [j, j - gap], 'swap');
        j -= gap;
        if (j >= gap) {
          await onStep(arr, [j, j - gap], 'compare');
        }
      }
      arr[j] = temp;
      await onStep(arr, [j], 'swap');
    }
  }

  return arr;
};

// Cocktail Sort (Bidirectional Bubble Sort)
export const cocktailSort = async (array, onStep) => {
  let arr = [...array];
  let start = 0;
  let end = arr.length - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    // Forward pass (like bubble sort)
    for (let i = start; i < end; i++) {
      await onStep(arr, [i, i + 1], 'compare');
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        await onStep(arr, [i, i + 1], 'swap');
        swapped = true;
      }
    }

    if (!swapped) break;

    end--;
    swapped = false;

    // Backward pass
    for (let i = end; i > start; i--) {
      await onStep(arr, [i, i - 1], 'compare');
      if (arr[i] < arr[i - 1]) {
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
        await onStep(arr, [i, i - 1], 'swap');
        swapped = true;
      }
    }

    start++;
  }

  return arr;
};

export const ALGORITHMS = [
  { 
    id: 'bubble', 
    title: 'Bubble Sort', 
    fn: bubbleSort, 
    complexity: 'O(n²)', 
    desc: 'Spot the largest values bubbling to the top!' 
  },
  { 
    id: 'selection', 
    title: 'Selection Sort', 
    fn: selectionSort, 
    complexity: 'O(n²)', 
    desc: 'Hunting for the smallest number to put first!' 
  },
  { 
    id: 'insertion', 
    title: 'Insertion Sort', 
    fn: insertionSort, 
    complexity: 'O(n²)', 
    desc: 'find small number by reverse bubbling sort.' 
  },
  { 
    id: 'quick', 
    title: 'Quick Sort', 
    fn: quickSort, 
    complexity: 'O(n log n)', 
    desc: 'Divides array into partitions and sorts them recursively.' 
  },
  { 
    id: 'merge', 
    title: 'Merge Sort', 
    fn: mergeSort, 
    complexity: 'O(n log n)', 
    desc: 'Recursively divides array in half and merges sorted parts.' 
  },
  { 
    id: 'heap', 
    title: 'Heap Sort', 
    fn: heapSort, 
    complexity: 'O(n log n)', 
    desc: 'Builds a max-heap and repeatedly extracts the maximum.' 
  },
  { 
    id: 'shell', 
    title: 'Shell Sort', 
    fn: shellSort, 
    complexity: 'O(n log n)', 
    desc: 'Sorts elements at specific intervals, reducing the gap.' 
  },
  { 
    id: 'cocktail', 
    title: 'Cocktail Sort', 
    fn: cocktailSort, 
    complexity: 'O(n²)', 
    desc: 'Bidirectional bubble sort, shaking elements both ways.' 
  },
];
