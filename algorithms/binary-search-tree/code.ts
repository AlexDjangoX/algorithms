/**
 * Binary Search Tree — build with insert, then look up with search.
 */
export const BST_CODE = `function insert(root: TreeNode | null, value: number): TreeNode {
  const newNode = new TreeNode(value);
  if (root === null) return newNode;

  let current = root;
  while (true) {
    if (value < current.value) {
      if (current.left === null) {
        current.left = newNode;
        return root;
      }
      current = current.left;
    } else if (value > current.value) {
      if (current.right === null) {
        current.right = newNode;
        return root;
      }
      current = current.right;
    } else {
      return root; // duplicate — skip
    }
  }
}

function search(root: TreeNode | null, target: number): TreeNode | null {
  let current = root;
  while (current !== null) {
    if (target === current.value) return current;
    if (target < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }
  }
  return null;
}`;
