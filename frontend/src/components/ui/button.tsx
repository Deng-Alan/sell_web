type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-full bg-ember px-4 py-2 text-sm font-medium text-white ${props.className ?? ""}`}
    />
  );
}
