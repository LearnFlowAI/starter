# Dashboard Interactions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make dashboard interactions responsive by enabling “查看全部”, task edit/delete actions, and notification bell with improved UX feedback.

**Architecture:** Keep all behavior in `app/dashboard/page.tsx` with local UI state + `useLocalState` for data persistence. Use existing `Modal` component to implement an edit sheet, delete confirmation dialog, and notifications drawer.

**Tech Stack:** Next.js (App Router), React, Tailwind, Vitest, React Testing Library.

### Task 1: View-all toggle behavior

**Files:**
- Modify: `app/dashboard/__tests__/page.test.tsx`
- Modify: `app/dashboard/page.tsx`

**Step 1: Write the failing test**

```tsx
it('toggles "查看全部" when task count > 3 and disables when <= 3', async () => {
  const manyTasks = Array.from({ length: 5 }).map((_, i) => ({
    ...MOCK_TASKS[0],
    id: `task-${i}`,
    name: `Task ${i + 1}`,
  }));
  localStorageMock.setItem('lf_all_tasks', JSON.stringify(manyTasks));
  render(<Page />);

  expect(screen.queryByText(/Task 4/i)).not.toBeInTheDocument();
  const toggleButton = screen.getByRole('button', { name: /查看全部/i });
  fireEvent.click(toggleButton);

  await waitFor(() => {
    expect(screen.getByText(/收起/i)).toBeInTheDocument();
    expect(screen.getByText(/Task 4/i)).toBeInTheDocument();
  });

  fireEvent.click(toggleButton);
  await waitFor(() => {
    expect(screen.getByText(/查看全部/i)).toBeInTheDocument();
    expect(screen.queryByText(/Task 4/i)).not.toBeInTheDocument();
  });

  localStorageMock.setItem('lf_all_tasks', JSON.stringify(MOCK_TASKS));
  render(<Page />);
  expect(screen.getByRole('button', { name: /已全部展示/i })).toBeDisabled();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: FAIL because button label/disabled behavior is not implemented.

**Step 3: Write minimal implementation**

- Only render active “查看全部/收起” toggle when `tasks.length > 3`.
- When `tasks.length <= 3`, render disabled button with label “已全部展示”.

**Step 4: Run test to verify it passes**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/__tests__/page.test.tsx
git commit -m "feat(dashboard): improve view-all toggle"
```

### Task 2: Notification drawer

**Files:**
- Modify: `app/dashboard/__tests__/page.test.tsx`
- Modify: `app/dashboard/page.tsx`

**Step 1: Write the failing test**

```tsx
it('opens notification drawer from bell button', async () => {
  render(<Page />);
  fireEvent.click(screen.getByRole('button', { name: /打开通知/i }));
  expect(await screen.findByText(/通知中心/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /关闭通知/i }));
  await waitFor(() => {
    expect(screen.queryByText(/通知中心/i)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: FAIL because drawer doesn’t exist.

**Step 3: Write minimal implementation**

- Add `isNotificationsOpen` state.
- Use `Modal` as a right-side drawer.
- Add bell button `aria-label="打开通知"` and close button `aria-label="关闭通知"`.
- Provide empty state if no notifications.

**Step 4: Run test to verify it passes**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/__tests__/page.test.tsx
git commit -m "feat(dashboard): add notification drawer"
```

### Task 3: Edit task modal

**Files:**
- Modify: `app/dashboard/__tests__/page.test.tsx`
- Modify: `app/dashboard/page.tsx`

**Step 1: Write the failing test**

```tsx
it('opens edit modal with prefilled fields and saves updates', async () => {
  render(<Page />);
  fireEvent.click(screen.getAllByRole('button', { name: /编辑任务/i })[0]);

  expect(await screen.findByText(/编辑任务/i)).toBeInTheDocument();
  const nameInput = screen.getByLabelText(/任务名称/i) as HTMLInputElement;
  fireEvent.change(nameInput, { target: { value: '新任务名' } });

  fireEvent.click(screen.getByRole('button', { name: /保存修改/i }));

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /新任务名/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: FAIL because modal and save behavior don’t exist.

**Step 3: Write minimal implementation**

- Add `editingTask` state and `isEditOpen` state.
- Add modal form fields with labels: “任务名称”, “科目”, “预计时长(分钟)”.
- On save: update task in `useLocalState`, close modal, show success toast.

**Step 4: Run test to verify it passes**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/__tests__/page.test.tsx
git commit -m "feat(tasks): edit task from dashboard"
```

### Task 4: Delete confirmation modal

**Files:**
- Modify: `app/dashboard/__tests__/page.test.tsx`
- Modify: `app/dashboard/page.tsx`

**Step 1: Write the failing test**

```tsx
it('confirms delete and removes task', async () => {
  render(<Page />);
  fireEvent.click(screen.getAllByRole('button', { name: /删除任务/i })[0]);
  expect(await screen.findByText(/确认删除/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /确认删除/ }));

  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: /数学 - 课后练习/i })).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: FAIL because delete modal/logic doesn’t exist.

**Step 3: Write minimal implementation**

- Add `deleteTarget` state and `isDeleteOpen` state.
- Show confirmation modal with task name and “取消/确认删除” actions.
- On confirm: remove task from `useLocalState`, clear activeTaskId if needed, show toast.

**Step 4: Run test to verify it passes**

Run: `pnpm test app/dashboard/__tests__/page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/__tests__/page.test.tsx
git commit -m "feat(tasks): confirm delete from dashboard"
```
