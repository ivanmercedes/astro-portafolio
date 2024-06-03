import { Image } from "@nextui-org/react";

export default function ImageNext({ image, title }) {
  return (
    <Image
    width={`100%`}
      isZoomed
      isBlurred
      alt={title}
      className="object-cover rounded-xl w-full opacity-100 max-h-60 min-h-full"
      src={image}
      loading="lazy"

    />
  );
}
