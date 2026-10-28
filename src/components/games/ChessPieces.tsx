import React from 'react';
import { ChessPieceColor, ChessPieceType } from '../../types/game';

interface ChessPieceSvgProps {
  type: ChessPieceType;
  color: ChessPieceColor;
  className?: string;
}

export const ChessPieceIcon: React.FC<ChessPieceSvgProps> = ({
  type,
  color,
  className = 'w-10 h-10',
}) => {
  const isWhite = color === 'w';
  const idPrefix = isWhite ? 'w_wood_' : 'b_wood_';

  // Palette definitions:
  // White piece: Polished Boxwood / Hard Maple (Buis / Érable verni)
  // Black piece: Hand-carved Dark Walnut / Ebony (Noyer foncé / Ébène poli)
  const woodLight = isWhite ? '#FFFBF2' : '#6E452B';
  const woodMidLight = isWhite ? '#F5E4C3' : '#4E2D1A';
  const woodMid = isWhite ? '#E1BC84' : '#361D10';
  const woodDark = isWhite ? '#B07D40' : '#221109';
  const woodDeepDark = isWhite ? '#7D5120' : '#120703';
  const strokeColor = isWhite ? '#643F17' : '#0B0401';
  const highlightColor = isWhite ? 'rgba(255,255,255,0.85)' : 'rgba(255,220,185,0.45)';
  const rimLightColor = isWhite ? '#FFECC4' : '#8A5636';

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} overflow-visible filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Ground pedestal 3D shadow under the piece base */}
        <radialGradient id={`${idPrefix}ground_shadow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.65" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* 3D Cylindrical Main Body Wood Gradient */}
        <linearGradient id={`${idPrefix}cylinder`} x1="15%" y1="0%" x2="85%" y2="0%">
          <stop offset="0%" stopColor={woodMid} />
          <stop offset="22%" stopColor={woodLight} />
          <stop offset="50%" stopColor={woodMidLight} />
          <stop offset="78%" stopColor={woodDark} />
          <stop offset="100%" stopColor={woodDeepDark} />
        </linearGradient>

        {/* 3D Vertical Turned Wood Gradient */}
        <linearGradient id={`${idPrefix}vertical`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={woodLight} />
          <stop offset="40%" stopColor={woodMidLight} />
          <stop offset="80%" stopColor={woodDark} />
          <stop offset="100%" stopColor={woodDeepDark} />
        </linearGradient>

        {/* 3D Spherical Head Highlight (Radial) */}
        <radialGradient id={`${idPrefix}sphere`} cx="36%" cy="32%" r="65%">
          <stop offset="0%" stopColor={woodLight} />
          <stop offset="35%" stopColor={woodMidLight} />
          <stop offset="75%" stopColor={woodDark} />
          <stop offset="100%" stopColor={woodDeepDark} />
        </radialGradient>

        {/* 3D Beveled Base Tier Gradient */}
        <linearGradient id={`${idPrefix}base_tier`} x1="10%" y1="0%" x2="90%" y2="0%">
          <stop offset="0%" stopColor={woodDark} />
          <stop offset="20%" stopColor={woodLight} />
          <stop offset="55%" stopColor={woodMid} />
          <stop offset="85%" stopColor={woodDeepDark} />
          <stop offset="100%" stopColor="#0a0502" />
        </linearGradient>

        {/* Carved Wood Rim / Specular Sheen */}
        <linearGradient id={`${idPrefix}specular`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={highlightColor} stopOpacity="0" />
          <stop offset="25%" stopColor={highlightColor} stopOpacity="1" />
          <stop offset="50%" stopColor={highlightColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Realistic contact shadow on the board square */}
      <ellipse cx="50" cy="89" rx="34" ry="7.5" fill={`url(#${idPrefix}ground_shadow)`} />

      {/* Render 3D Piece Sculptures */}
      {type === 'p' && (
        <g id="pawn_3d">
          {/* Base Lower Tier */}
          <ellipse cx="50" cy="84" rx="27" ry="5.5" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />
          <path d="M23 84 C23 79 31 77 50 77 C69 77 77 79 77 84 L75 87 C68 91 32 91 25 87 Z" fill={`url(#${idPrefix}cylinder)`} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="77" rx="22" ry="4" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1" />

          {/* Waist / Flared Pedestal */}
          <path
            d="M31 77 C34 68 40 60 41 52 C41 49 39 48 39 46 C39 44 43 43 50 43 C57 43 61 44 61 46 C61 48 59 49 59 52 C60 60 66 68 69 77 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Turned Collar Ring */}
          <ellipse cx="50" cy="45" rx="13" ry="3.2" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />

          {/* Rounded Spherical Head */}
          <circle cx="50" cy="30" r="15" fill={`url(#${idPrefix}sphere)`} stroke={strokeColor} strokeWidth="1.2" />

          {/* Spherical Specular Glaze */}
          <ellipse cx="44" cy="24" rx="5" ry="3.5" transform="rotate(-25 44 24)" fill={highlightColor} opacity={isWhite ? '0.8' : '0.55'} />
          {/* Body curved sheen line */}
          <path d="M43 52 C42 60 37 68 34 75" stroke={highlightColor} strokeWidth="2" strokeLinecap="round" opacity={isWhite ? '0.6' : '0.4'} fill="none" />
          {/* Rim bounce light */}
          <path d="M66 75 C63 68 58 60 58 52" stroke={rimLightColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
        </g>
      )}

      {type === 'r' && (
        <g id="rook_3d">
          {/* Base Lower Tier */}
          <ellipse cx="50" cy="85" rx="30" ry="6" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />
          <path d="M20 85 C20 79 30 77 50 77 C70 77 80 79 80 85 L78 88 C70 93 30 93 22 88 Z" fill={`url(#${idPrefix}cylinder)`} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="77" rx="25" ry="4.5" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1" />

          {/* Tapered Tower Trunk */}
          <path
            d="M27 77 L32 40 L68 40 L73 77 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Tower Capital Collar Ring */}
          <ellipse cx="50" cy="40" rx="21" ry="4" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />

          {/* Crenellated Parapet (Les créneaux de la tour) */}
          <path
            d="M28 40 L27 25 L36 25 L36 30 L43 30 L43 25 L57 25 L57 30 L64 30 L64 25 L73 25 L72 40 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          {/* Inside dark hollow of the parapet */}
          <ellipse cx="50" cy="25" rx="19" ry="3.5" fill={woodDeepDark} opacity="0.8" />

          {/* Highlights & Carved vertical stone lines */}
          <line x1="36" y1="42" x2="33" y2="75" stroke={highlightColor} strokeWidth="2.5" strokeLinecap="round" opacity={isWhite ? '0.7' : '0.45'} />
          <line x1="64" y1="42" x2="67" y2="75" stroke={rimLightColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <path d="M40 50 L60 50 M39 62 L61 62" stroke={strokeColor} strokeWidth="0.9" opacity="0.35" />
        </g>
      )}

      {type === 'n' && (
        <g id="knight_3d">
          {/* Base Lower Tier */}
          <ellipse cx="50" cy="85" rx="29" ry="6" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />
          <path d="M21 85 C21 79 31 77 50 77 C69 77 79 79 79 85 L77 88 C70 93 30 93 23 88 Z" fill={`url(#${idPrefix}cylinder)`} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="77" rx="24" ry="4.5" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1" />

          {/* Intricately Sculpted 3D Staunton Horse Head */}
          <path
            d="M28 77 C29 65 30 52 35 44 C33 42 32 37 32 30 C32 23 35 17 41 15 C43 15 44 19 47 18 C50 17 52 14 55 14 C57 14 56 18 57 20 C60 19 64 21 66 25 C72 34 76 49 71 77 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Muzzle & Jaw Sculpture */}
          <path
            d="M35 44 C28 47 22 51 22 56 C22 60 27 62 33 59 C37 57 41 53 43 49 C44 46 41 43 35 44 Z"
            fill={`url(#${idPrefix}sphere)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Carved Mane Locks */}
          <path
            d="M55 18 C59 21 61 27 65 29 M57 32 C62 35 65 41 68 45 M58 48 C63 51 67 58 69 63"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M53 19 C57 22 59 28 63 30 M55 33 C60 36 63 42 66 46"
            stroke={highlightColor}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity={isWhite ? '0.7' : '0.4'}
            fill="none"
          />

          {/* Eye & Nostril Details */}
          <ellipse cx="37" cy="34" rx="3" ry="2.2" transform="rotate(-15 37 34)" fill={strokeColor} />
          <circle cx="36" cy="33" r="0.9" fill={highlightColor} />
          <ellipse cx="25" cy="55" rx="2" ry="1.2" fill={strokeColor} />

          {/* Neck Sheen Curve */}
          <path
            d="M38 46 C41 55 42 66 43 75"
            stroke={highlightColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            opacity={isWhite ? '0.75' : '0.45'}
            fill="none"
          />
          {/* Muzzle Highlight */}
          <path
            d="M26 53 C27 50 31 47 36 45"
            stroke={highlightColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={isWhite ? '0.85' : '0.5'}
            fill="none"
          />
        </g>
      )}

      {type === 'b' && (
        <g id="bishop_3d">
          {/* Base Lower Tier */}
          <ellipse cx="50" cy="85" rx="28" ry="5.8" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />
          <path d="M22 85 C22 79 32 77 50 77 C68 77 78 79 78 85 L76 88 C68 93 32 93 24 88 Z" fill={`url(#${idPrefix}cylinder)`} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="77" rx="23" ry="4.2" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1" />

          {/* Stem & Sculpted Rings */}
          <path
            d="M32 77 C35 68 40 60 41 53 L59 53 C60 60 65 68 68 77 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <ellipse cx="50" cy="53" rx="14" ry="3.2" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />

          {/* Ovoid Mitre Body */}
          <path
            d="M33 51 C31 42 34 26 50 20 C66 26 69 42 67 51 C62 55 38 55 33 51 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Signature Mitre Cut / Slit (L'entaille du fou) */}
          <path
            d="M45 23 L41 39 L47 41 L51 25 Z"
            fill={woodDeepDark}
            stroke={strokeColor}
            strokeWidth="0.8"
          />

          {/* Top Finial Ball */}
          <circle cx="50" cy="18" r="4.2" fill={`url(#${idPrefix}sphere)`} stroke={strokeColor} strokeWidth="1" />
          <circle cx="48.5" cy="16.5" r="1.3" fill={highlightColor} opacity="0.9" />

          {/* 3D Longitudinal Highlight */}
          <path
            d="M38 28 C36 36 38 45 40 50"
            stroke={highlightColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity={isWhite ? '0.75' : '0.45'}
            fill="none"
          />
          <line x1="43" y1="56" x2="37" y2="74" stroke={highlightColor} strokeWidth="2.2" strokeLinecap="round" opacity={isWhite ? '0.7' : '0.4'} />
        </g>
      )}

      {type === 'q' && (
        <g id="queen_3d">
          {/* Base Lower Tier */}
          <ellipse cx="50" cy="86" rx="31" ry="6" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />
          <path d="M19 86 C19 80 30 78 50 78 C70 78 81 80 81 86 L79 89 C70 94 30 94 21 89 Z" fill={`url(#${idPrefix}cylinder)`} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="78" rx="26" ry="4.5" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1" />

          {/* Tapered Royal Waist */}
          <path
            d="M30 78 C33 65 38 52 39 44 L61 44 C62 52 67 65 70 78 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <ellipse cx="50" cy="44" rx="16" ry="3.5" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />

          {/* Flared Queen's Coronet (Couronne dentelée) */}
          <path
            d="M34 44 L24 22 L36 31 L50 20 L64 31 L76 22 L66 44 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />

          {/* Coronet Pearls / Spheres */}
          <circle cx="24" cy="21" r="3.2" fill={`url(#${idPrefix}sphere)`} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="36" cy="30" r="2.8" fill={`url(#${idPrefix}sphere)`} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="50" cy="19" r="4.2" fill={`url(#${idPrefix}sphere)`} stroke={strokeColor} strokeWidth="1" />
          <circle cx="64" cy="30" r="2.8" fill={`url(#${idPrefix}sphere)`} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="76" cy="21" r="3.2" fill={`url(#${idPrefix}sphere)`} stroke={strokeColor} strokeWidth="0.8" />

          {/* Pearl Highlights */}
          <circle cx="23" cy="20" r="1.1" fill={highlightColor} />
          <circle cx="48.5" cy="17.5" r="1.4" fill={highlightColor} />
          <circle cx="75" cy="20" r="1.1" fill={highlightColor} />

          {/* Queen Waist & Crown Sheen */}
          <path d="M41 46 C38 56 35 66 33 75" stroke={highlightColor} strokeWidth="2.5" strokeLinecap="round" opacity={isWhite ? '0.75' : '0.45'} fill="none" />
          <path d="M45 28 L40 40" stroke={highlightColor} strokeWidth="2" strokeLinecap="round" opacity={isWhite ? '0.7' : '0.4'} fill="none" />
        </g>
      )}

      {type === 'k' && (
        <g id="king_3d">
          {/* Base Lower Tier */}
          <ellipse cx="50" cy="86" rx="32" ry="6.2" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />
          <path d="M18 86 C18 80 29 78 50 78 C71 78 82 80 82 86 L80 89 C70 94 30 94 20 89 Z" fill={`url(#${idPrefix}cylinder)`} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="78" rx="27" ry="4.5" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1" />

          {/* Regal Solid Robe / Trunk */}
          <path
            d="M29 78 C32 64 37 50 38 42 L62 42 C63 50 68 64 71 78 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <ellipse cx="50" cy="42" rx="17" ry="3.8" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1.2" />

          {/* Flared Imperial Coronet Head */}
          <path
            d="M33 42 C30 33 32 24 50 22 C68 24 70 33 67 42 Z"
            fill={`url(#${idPrefix}cylinder)`}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
          <ellipse cx="50" cy="22" rx="13" ry="3" fill={`url(#${idPrefix}base_tier)`} stroke={strokeColor} strokeWidth="1" />

          {/* Royal Cross Finial (Croix royale en 3D sculptée) */}
          <g id="royal_cross">
            <rect x="47.5" y="10" width="5" height="12" rx="1" fill={`url(#${idPrefix}vertical)`} stroke={strokeColor} strokeWidth="0.8" />
            <rect x="43.5" y="12.5" width="13" height="4.5" rx="1" fill={`url(#${idPrefix}cylinder)`} stroke={strokeColor} strokeWidth="0.8" />
            <circle cx="50" cy="14.7" r="1.5" fill={woodLight} />
          </g>

          {/* Carved Vertical Robe Grooves & Sheen */}
          <path d="M41 44 C38 54 34 65 32 75" stroke={highlightColor} strokeWidth="2.6" strokeLinecap="round" opacity={isWhite ? '0.8' : '0.45'} fill="none" />
          <path d="M60 44 C62 54 65 65 68 75" stroke={rimLightColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" fill="none" />
          <path d="M43 25 C41 31 41 38 42 41" stroke={highlightColor} strokeWidth="1.8" strokeLinecap="round" opacity={isWhite ? '0.75' : '0.4'} fill="none" />
        </g>
      )}
    </svg>
  );
};
