var valid_years = [
    1839,
    1841,
    1842,
    1843,
    1844,
    1845,
    1846,
    1847,
    1848,
    1849,
    1850,
    1851,
    1852,
    1853,
    1854,
    1855,
    1856,
    1857,
    1858,
    1859,
    1860,
    1861,
    1862,
    1863,
    1864,
    1870,
    1871,
    1873,
    1874,
    1875,
    1876,
    1877,
    1878,
    1879,
    1880,
    1881,
    1882,
    1883,
    1884,
    1885,
    1886,
    1887,
    1888,
    1890,
    1893,
    1894,
    1896,
    1897,
    1898,
    1900,
    1901,
    1907,
    1914,
    1921,
    1922
];

var doc2start = {
    "bpt6k63243601": 123,
    "bpt6k62931221": 151,
    "bpt6k6286466w": 189,
    "bpt6k6393838j": 219,
    "bpt6k6331310g": 216,
    "bpt6k6292987t": 353,
    "bpt6k62906378": 288,
    "bpt6k6391515w": 319,
    "bpt6k6315927h": 349,
    "bpt6k6319106t": 324,
    "bpt6k6315985z": 82,
    "bpt6k63959929": 82,
    "bpt6k63197984": 56,
    "bpt6k6389871r": 77,
    "bpt6k6319811j": 79,
    "bpt6k6282019m": 72,
    "bpt6k6314752k": 190,
    "bpt6k6305463c": 113,
    "bpt6k6318531z": 108,
    "bpt6k6324389h": 72,
    "bpt6k63243920": 80,
    "bpt6k6309075f": 96,
    "bpt6k6333200c": 132,
    "bpt6k63243905": 134,
    "bpt6k6333170p": 137,
    "bpt6k96727875": 135,
    "bpt6k9764746t": 99,
    "bpt6k97645375": 123,
    "bpt6k9672117f": 125,
    "bpt6k9763554c": 123,
    "bpt6k9763553z": 105,
    "bpt6k9677392n": 110,
    "bpt6k9692809v": 113,
    "bpt6k9762929c": 129,
    "bpt6k9672776c": 119,
    "bpt6k9764647w": 121,
    "bpt6k9669143t": 145,
    "bpt6k9677737t": 139,
    "bpt6k9668037f": 167,
    "bpt6k96839542": 171,
    "bpt6k96762564": 185,
    "bpt6k9685861g": 189,
    "bpt6k9763471j": 153,
    "bpt6k9762899p": 157,
    "bpt6k97630871": 11,
    "bpt6k9684454n": 235,
    "bpt6k9732740w": 239,
    "bpt6k9684013b": 189,
    "bpt6k9692626p": 305,
    "bpt6k9685098r": 281,
    "bpt6k9764402m": 329,
    "bpt6k97631451": 322,
    "bpt6k9776121t": 49,
    "bpt6k9775724t": 33,
    "bpt6k97774838": 327,
    "bpt6k9780089g": 339
};
var convert_date = {
    1839: 1839,
    1840: 1839,
    1841: 1841,
    1842: 1842,
    1843: 1843,
    1844: 1844,
    1845: 1845,
    1846: 1846,
    1847: 1847,
    1848: 1848,
    1849: 1849,
    1850: 1850,
    1851: 1851,
    1852: 1852,
    1853: 1853,
    1854: 1854,
    1855: 1855,
    1856: 1856,
    1857: 1857,
    1858: 1858,
    1859: 1859,
    1860: 1860,
    1861: 1861,
    1862: 1862,
    1863: 1863,
    1864: 1864,
    1865: 1864,
    1866: 1864,
    1867: 1864,
    1868: 1870,
    1869: 1870,
    1870: 1870,
    1871: 1871,
    1872: 1871,
    1873: 1873,
    1874: 1874,
    1875: 1875,
    1876: 1876,
    1877: 1877,
    1878: 1878,
    1879: 1879,
    1880: 1880,
    1881: 1881,
    1882: 1882,
    1883: 1883,
    1884: 1884,
    1885: 1885,
    1886: 1886,
    1887: 1887,
    1888: 1888,
    1889: 1888,
    1890: 1890,
    1891: 1890,
    1892: 1893,
    1893: 1893,
    1894: 1894,
    1895: 1894,
    1896: 1896,
    1897: 1897,
    1898: 1898,
    1899: 1898,
    1900: 1900,
    1901: 1901,
    1902: 1901,
    1903: 1901,
    1904: 1901,
    1905: 1907,
    1906: 1907,
    1907: 1907,
    1908: 1907,
    1909: 1907,
    1910: 1907,
    1911: 1914,
    1912: 1914,
    1913: 1914,
    1914: 1914,
    1915: 1914,
    1916: 1914,
    1917: 1921,
    1917: 1921,
    1919: 1921,
    1920: 1921,
    1921: 1921,
    1922: 1922
};
