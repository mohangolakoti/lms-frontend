import {
  compactLogo,
  fullLogo,
  logoOnly,
  productLogo,
  shortLogo,
} from '../constants';

const LOGO_VARIANTS = {
  full: fullLogo,
  compact: compactLogo,
  short: shortLogo,
  'logo-only': logoOnly,
  product: productLogo,
};

const Logo = ({
  variant = 'product',
  alt = 'SiliconMeta Learning logo',
  className = '',
  ...props
}) => {
  const src = LOGO_VARIANTS[variant] || LOGO_VARIANTS.product;

  return (
    <img
      src={src}
      alt={alt}
      draggable="false"
      decoding="async"
      className={`block object-contain select-none ${className}`.trim()}
      {...props}
    />
  );
};

export default Logo;