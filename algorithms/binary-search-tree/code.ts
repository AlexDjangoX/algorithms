/**
 * Binary Search Tree insertion — display code for the code viewer.
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
}`;
