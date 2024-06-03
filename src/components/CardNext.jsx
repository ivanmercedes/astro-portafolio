import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";

export default function CardNext({ title, image, slug = null }) {
  return (
    <Card className="py-2">
      <CardBody className="overflow-visible py-2">
        {slug ? (
          <a href={`${slug}`} 
          ediaTransitionName={`media-image-${slug}`}
          // style={{viewTransitionName:  `media-image-${slug?.replace("blog/", "")}`}}
          >
            <Image
              isBlurred
              alt={title}
              className="object-cover rounded-xl opacity-100 w-full "
              src={image}
            />
          </a>
        ) : (
          <Image
            isBlurred
            alt={title}
            className="object-cover rounded-xl opacity-100 w-full "
            src={image}
          />
        )}
      </CardBody>
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        {/* <p className="text-tiny uppercase font-bold">Daily Mix</p>
        <small className="text-default-500">12 Tracks</small> */}
        <h4 className="font-bold text-large">{title}</h4>
      </CardHeader>
    </Card>
  );
}
