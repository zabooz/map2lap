import * as THREE from "three";
import {DDSLoader} from "three/addons/loaders/DDSLoader.js";

/** The texture with the file name file from its bytes. */
export async function makeTexture(buf: ArrayBuffer, file: string, anisotropy: number, linear = false) {
  let t: THREE.Texture;
  if (/\.r16$/i.test(file)) {
    const header = new DataView(buf);
    if (header.getUint32(0, true) !== 0x5747324d) throw new Error("Invalid regional ground atlas");
    const width = header.getUint32(4, true), height = header.getUint32(8, true);
    if (!width || !height || buf.byteLength !== 12 + width * height * 2) throw new Error("Invalid regional ground dimensions");
    t = new THREE.DataTexture(new Uint16Array(buf, 12), width, height, THREE.RedFormat, THREE.HalfFloatType);
    t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;
  } else if (/\.dds$/i.test(file)) {
    const d = new DDSLoader().parse(buf, true);
    if (d.format === THREE.RGBAFormat) {
      t = new THREE.DataTexture(d.mipmaps[0].data, d.width, d.height, THREE.RGBAFormat);
      t.mipmaps = d.mipmaps as ImageData[];
      t.generateMipmaps = false;
      t.magFilter = THREE.LinearFilter;     // (a DataTexture's is nearest: a 1 m mask texel would show as a square close by)
    } else {
      t = new THREE.CompressedTexture(d.mipmaps as ImageData[], d.width, d.height, d.format as THREE.CompressedPixelFormat);
    }
    t.minFilter = d.mipmapCount > 1 ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  } else {
    const bitmap = await createImageBitmap(new Blob([buf]), {imageOrientation: "none", premultiplyAlpha: "none"});
    t = new THREE.Texture(bitmap);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
  }
  t.flipY = false;                  // (kn5's uv: from the image's top left, as DirectX reads it)
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = anisotropy;
  t.colorSpace = linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
