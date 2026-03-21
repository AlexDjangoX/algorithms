/**
 * Binary Search Tree — build with insert, then look up with search.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const BST_CODE = `function insert(root: TreeNode | null, value: number): TreeNode {
  const newNode = new TreeNode(value);
  if (root === null) return newNode;

  let current = root;
  while (true) {
    // BST property: left subtree keys < node.key < right subtree keys (strict).
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
      return root; // duplicate — do not insert a second node
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
