import { useState, useEffect } from "react";

// 365 curated verses — one per day, 0-indexed (Jan 1 = index 0)
const DAILY_VERSES = [
  // Genesis
  { book: "genesis",        chapter: 1,   verse: 1,  ref: "Genesis 1:1"           },
  { book: "genesis",        chapter: 1,   verse: 3,  ref: "Genesis 1:3"           },
  { book: "genesis",        chapter: 2,   verse: 7,  ref: "Genesis 2:7"           },
  { book: "genesis",        chapter: 3,   verse: 15, ref: "Genesis 3:15"          },
  { book: "genesis",        chapter: 12,  verse: 1,  ref: "Genesis 12:1"          },
  { book: "genesis",        chapter: 15,  verse: 6,  ref: "Genesis 15:6"          },
  { book: "genesis",        chapter: 17,  verse: 1,  ref: "Genesis 17:1"          },
  { book: "genesis",        chapter: 18,  verse: 14, ref: "Genesis 18:14"         },
  { book: "genesis",        chapter: 28,  verse: 15, ref: "Genesis 28:15"         },
  { book: "genesis",        chapter: 50,  verse: 20, ref: "Genesis 50:20"         },
  // Exodus
  { book: "exodus",         chapter: 3,   verse: 14, ref: "Exodus 3:14"           },
  { book: "exodus",         chapter: 14,  verse: 14, ref: "Exodus 14:14"          },
  { book: "exodus",         chapter: 15,  verse: 2,  ref: "Exodus 15:2"           },
  { book: "exodus",         chapter: 20,  verse: 3,  ref: "Exodus 20:3"           },
  { book: "exodus",         chapter: 33,  verse: 14, ref: "Exodus 33:14"          },
  { book: "exodus",         chapter: 34,  verse: 6,  ref: "Exodus 34:6"           },
  // Numbers
  { book: "numbers",        chapter: 6,   verse: 24, ref: "Numbers 6:24"          },
  { book: "numbers",        chapter: 6,   verse: 26, ref: "Numbers 6:26"          },
  // Deuteronomy
  { book: "deuteronomy",    chapter: 4,   verse: 29, ref: "Deuteronomy 4:29"      },
  { book: "deuteronomy",    chapter: 6,   verse: 5,  ref: "Deuteronomy 6:5"       },
  { book: "deuteronomy",    chapter: 7,   verse: 9,  ref: "Deuteronomy 7:9"       },
  { book: "deuteronomy",    chapter: 8,   verse: 3,  ref: "Deuteronomy 8:3"       },
  { book: "deuteronomy",    chapter: 31,  verse: 6,  ref: "Deuteronomy 31:6"      },
  { book: "deuteronomy",    chapter: 31,  verse: 8,  ref: "Deuteronomy 31:8"      },
  // Joshua
  { book: "joshua",         chapter: 1,   verse: 8,  ref: "Joshua 1:8"            },
  { book: "joshua",         chapter: 1,   verse: 9,  ref: "Joshua 1:9"            },
  { book: "joshua",         chapter: 24,  verse: 15, ref: "Joshua 24:15"          },
  // Ruth
  { book: "ruth",           chapter: 1,   verse: 16, ref: "Ruth 1:16"             },
  // 1 Samuel
  { book: "1samuel",        chapter: 16,  verse: 7,  ref: "1 Samuel 16:7"         },
  // 2 Chronicles
  { book: "2chronicles",    chapter: 7,   verse: 14, ref: "2 Chronicles 7:14"     },
  { book: "2chronicles",    chapter: 20,  verse: 15, ref: "2 Chronicles 20:15"    },
  // Nehemiah
  { book: "nehemiah",       chapter: 8,   verse: 10, ref: "Nehemiah 8:10"         },
  // Job
  { book: "job",            chapter: 19,  verse: 25, ref: "Job 19:25"             },
  { book: "job",            chapter: 23,  verse: 10, ref: "Job 23:10"             },
  // Psalms
  { book: "psalms",         chapter: 1,   verse: 1,  ref: "Psalm 1:1"             },
  { book: "psalms",         chapter: 1,   verse: 2,  ref: "Psalm 1:2"             },
  { book: "psalms",         chapter: 1,   verse: 3,  ref: "Psalm 1:3"             },
  { book: "psalms",         chapter: 4,   verse: 8,  ref: "Psalm 4:8"             },
  { book: "psalms",         chapter: 5,   verse: 3,  ref: "Psalm 5:3"             },
  { book: "psalms",         chapter: 16,  verse: 8,  ref: "Psalm 16:8"            },
  { book: "psalms",         chapter: 16,  verse: 11, ref: "Psalm 16:11"           },
  { book: "psalms",         chapter: 18,  verse: 2,  ref: "Psalm 18:2"            },
  { book: "psalms",         chapter: 19,  verse: 1,  ref: "Psalm 19:1"            },
  { book: "psalms",         chapter: 19,  verse: 7,  ref: "Psalm 19:7"            },
  { book: "psalms",         chapter: 19,  verse: 14, ref: "Psalm 19:14"           },
  { book: "psalms",         chapter: 23,  verse: 1,  ref: "Psalm 23:1"            },
  { book: "psalms",         chapter: 23,  verse: 4,  ref: "Psalm 23:4"            },
  { book: "psalms",         chapter: 23,  verse: 6,  ref: "Psalm 23:6"            },
  { book: "psalms",         chapter: 24,  verse: 1,  ref: "Psalm 24:1"            },
  { book: "psalms",         chapter: 25,  verse: 4,  ref: "Psalm 25:4"            },
  { book: "psalms",         chapter: 25,  verse: 5,  ref: "Psalm 25:5"            },
  { book: "psalms",         chapter: 27,  verse: 1,  ref: "Psalm 27:1"            },
  { book: "psalms",         chapter: 27,  verse: 4,  ref: "Psalm 27:4"            },
  { book: "psalms",         chapter: 27,  verse: 14, ref: "Psalm 27:14"           },
  { book: "psalms",         chapter: 28,  verse: 7,  ref: "Psalm 28:7"            },
  { book: "psalms",         chapter: 30,  verse: 5,  ref: "Psalm 30:5"            },
  { book: "psalms",         chapter: 31,  verse: 24, ref: "Psalm 31:24"           },
  { book: "psalms",         chapter: 32,  verse: 7,  ref: "Psalm 32:7"            },
  { book: "psalms",         chapter: 33,  verse: 4,  ref: "Psalm 33:4"            },
  { book: "psalms",         chapter: 34,  verse: 8,  ref: "Psalm 34:8"            },
  { book: "psalms",         chapter: 34,  verse: 18, ref: "Psalm 34:18"           },
  { book: "psalms",         chapter: 37,  verse: 4,  ref: "Psalm 37:4"            },
  { book: "psalms",         chapter: 37,  verse: 5,  ref: "Psalm 37:5"            },
  { book: "psalms",         chapter: 37,  verse: 7,  ref: "Psalm 37:7"            },
  { book: "psalms",         chapter: 37,  verse: 23, ref: "Psalm 37:23"           },
  { book: "psalms",         chapter: 40,  verse: 1,  ref: "Psalm 40:1"            },
  { book: "psalms",         chapter: 42,  verse: 1,  ref: "Psalm 42:1"            },
  { book: "psalms",         chapter: 42,  verse: 5,  ref: "Psalm 42:5"            },
  { book: "psalms",         chapter: 46,  verse: 1,  ref: "Psalm 46:1"            },
  { book: "psalms",         chapter: 46,  verse: 10, ref: "Psalm 46:10"           },
  { book: "psalms",         chapter: 51,  verse: 10, ref: "Psalm 51:10"           },
  { book: "psalms",         chapter: 51,  verse: 12, ref: "Psalm 51:12"           },
  { book: "psalms",         chapter: 55,  verse: 22, ref: "Psalm 55:22"           },
  { book: "psalms",         chapter: 56,  verse: 3,  ref: "Psalm 56:3"            },
  { book: "psalms",         chapter: 62,  verse: 1,  ref: "Psalm 62:1"            },
  { book: "psalms",         chapter: 62,  verse: 5,  ref: "Psalm 62:5"            },
  { book: "psalms",         chapter: 63,  verse: 1,  ref: "Psalm 63:1"            },
  { book: "psalms",         chapter: 63,  verse: 3,  ref: "Psalm 63:3"            },
  { book: "psalms",         chapter: 84,  verse: 1,  ref: "Psalm 84:1"            },
  { book: "psalms",         chapter: 84,  verse: 10, ref: "Psalm 84:10"           },
  { book: "psalms",         chapter: 84,  verse: 11, ref: "Psalm 84:11"           },
  { book: "psalms",         chapter: 86,  verse: 15, ref: "Psalm 86:15"           },
  { book: "psalms",         chapter: 90,  verse: 1,  ref: "Psalm 90:1"            },
  { book: "psalms",         chapter: 90,  verse: 2,  ref: "Psalm 90:2"            },
  { book: "psalms",         chapter: 91,  verse: 1,  ref: "Psalm 91:1"            },
  { book: "psalms",         chapter: 91,  verse: 2,  ref: "Psalm 91:2"            },
  { book: "psalms",         chapter: 91,  verse: 4,  ref: "Psalm 91:4"            },
  { book: "psalms",         chapter: 91,  verse: 11, ref: "Psalm 91:11"           },
  { book: "psalms",         chapter: 94,  verse: 19, ref: "Psalm 94:19"           },
  { book: "psalms",         chapter: 95,  verse: 6,  ref: "Psalm 95:6"            },
  { book: "psalms",         chapter: 100, verse: 1,  ref: "Psalm 100:1"           },
  { book: "psalms",         chapter: 100, verse: 3,  ref: "Psalm 100:3"           },
  { book: "psalms",         chapter: 100, verse: 4,  ref: "Psalm 100:4"           },
  { book: "psalms",         chapter: 100, verse: 5,  ref: "Psalm 100:5"           },
  { book: "psalms",         chapter: 103, verse: 1,  ref: "Psalm 103:1"           },
  { book: "psalms",         chapter: 103, verse: 2,  ref: "Psalm 103:2"           },
  { book: "psalms",         chapter: 103, verse: 8,  ref: "Psalm 103:8"           },
  { book: "psalms",         chapter: 103, verse: 12, ref: "Psalm 103:12"          },
  { book: "psalms",         chapter: 107, verse: 1,  ref: "Psalm 107:1"           },
  { book: "psalms",         chapter: 107, verse: 9,  ref: "Psalm 107:9"           },
  { book: "psalms",         chapter: 112, verse: 7,  ref: "Psalm 112:7"           },
  { book: "psalms",         chapter: 116, verse: 1,  ref: "Psalm 116:1"           },
  { book: "psalms",         chapter: 118, verse: 24, ref: "Psalm 118:24"          },
  { book: "psalms",         chapter: 119, verse: 9,  ref: "Psalm 119:9"           },
  { book: "psalms",         chapter: 119, verse: 11, ref: "Psalm 119:11"          },
  { book: "psalms",         chapter: 119, verse: 105,ref: "Psalm 119:105"         },
  { book: "psalms",         chapter: 121, verse: 1,  ref: "Psalm 121:1"           },
  { book: "psalms",         chapter: 121, verse: 2,  ref: "Psalm 121:2"           },
  { book: "psalms",         chapter: 121, verse: 5,  ref: "Psalm 121:5"           },
  { book: "psalms",         chapter: 121, verse: 7,  ref: "Psalm 121:7"           },
  { book: "psalms",         chapter: 126, verse: 3,  ref: "Psalm 126:3"           },
  { book: "psalms",         chapter: 127, verse: 1,  ref: "Psalm 127:1"           },
  { book: "psalms",         chapter: 130, verse: 5,  ref: "Psalm 130:5"           },
  { book: "psalms",         chapter: 133, verse: 1,  ref: "Psalm 133:1"           },
  { book: "psalms",         chapter: 136, verse: 1,  ref: "Psalm 136:1"           },
  { book: "psalms",         chapter: 139, verse: 1,  ref: "Psalm 139:1"           },
  { book: "psalms",         chapter: 139, verse: 14, ref: "Psalm 139:14"          },
  { book: "psalms",         chapter: 139, verse: 23, ref: "Psalm 139:23"          },
  { book: "psalms",         chapter: 143, verse: 10, ref: "Psalm 143:10"          },
  { book: "psalms",         chapter: 145, verse: 3,  ref: "Psalm 145:3"           },
  { book: "psalms",         chapter: 145, verse: 8,  ref: "Psalm 145:8"           },
  { book: "psalms",         chapter: 145, verse: 18, ref: "Psalm 145:18"          },
  { book: "psalms",         chapter: 147, verse: 3,  ref: "Psalm 147:3"           },
  { book: "psalms",         chapter: 150, verse: 6,  ref: "Psalm 150:6"           },
  // Proverbs
  { book: "proverbs",       chapter: 1,   verse: 7,  ref: "Proverbs 1:7"          },
  { book: "proverbs",       chapter: 2,   verse: 6,  ref: "Proverbs 2:6"          },
  { book: "proverbs",       chapter: 3,   verse: 5,  ref: "Proverbs 3:5"          },
  { book: "proverbs",       chapter: 3,   verse: 6,  ref: "Proverbs 3:6"          },
  { book: "proverbs",       chapter: 3,   verse: 7,  ref: "Proverbs 3:7"          },
  { book: "proverbs",       chapter: 3,   verse: 24, ref: "Proverbs 3:24"         },
  { book: "proverbs",       chapter: 4,   verse: 7,  ref: "Proverbs 4:7"          },
  { book: "proverbs",       chapter: 4,   verse: 23, ref: "Proverbs 4:23"         },
  { book: "proverbs",       chapter: 10,  verse: 12, ref: "Proverbs 10:12"        },
  { book: "proverbs",       chapter: 11,  verse: 14, ref: "Proverbs 11:14"        },
  { book: "proverbs",       chapter: 13,  verse: 20, ref: "Proverbs 13:20"        },
  { book: "proverbs",       chapter: 14,  verse: 12, ref: "Proverbs 14:12"        },
  { book: "proverbs",       chapter: 15,  verse: 1,  ref: "Proverbs 15:1"         },
  { book: "proverbs",       chapter: 16,  verse: 3,  ref: "Proverbs 16:3"         },
  { book: "proverbs",       chapter: 16,  verse: 9,  ref: "Proverbs 16:9"         },
  { book: "proverbs",       chapter: 17,  verse: 17, ref: "Proverbs 17:17"        },
  { book: "proverbs",       chapter: 18,  verse: 10, ref: "Proverbs 18:10"        },
  { book: "proverbs",       chapter: 18,  verse: 24, ref: "Proverbs 18:24"        },
  { book: "proverbs",       chapter: 19,  verse: 21, ref: "Proverbs 19:21"        },
  { book: "proverbs",       chapter: 22,  verse: 6,  ref: "Proverbs 22:6"         },
  { book: "proverbs",       chapter: 27,  verse: 17, ref: "Proverbs 27:17"        },
  { book: "proverbs",       chapter: 31,  verse: 30, ref: "Proverbs 31:30"        },
  // Ecclesiastes
  { book: "ecclesiastes",   chapter: 3,   verse: 1,  ref: "Ecclesiastes 3:1"      },
  { book: "ecclesiastes",   chapter: 12,  verse: 13, ref: "Ecclesiastes 12:13"    },
  // Isaiah
  { book: "isaiah",         chapter: 1,   verse: 18, ref: "Isaiah 1:18"           },
  { book: "isaiah",         chapter: 6,   verse: 8,  ref: "Isaiah 6:8"            },
  { book: "isaiah",         chapter: 9,   verse: 6,  ref: "Isaiah 9:6"            },
  { book: "isaiah",         chapter: 26,  verse: 3,  ref: "Isaiah 26:3"           },
  { book: "isaiah",         chapter: 26,  verse: 4,  ref: "Isaiah 26:4"           },
  { book: "isaiah",         chapter: 30,  verse: 18, ref: "Isaiah 30:18"          },
  { book: "isaiah",         chapter: 40,  verse: 8,  ref: "Isaiah 40:8"           },
  { book: "isaiah",         chapter: 40,  verse: 28, ref: "Isaiah 40:28"          },
  { book: "isaiah",         chapter: 40,  verse: 29, ref: "Isaiah 40:29"          },
  { book: "isaiah",         chapter: 40,  verse: 31, ref: "Isaiah 40:31"          },
  { book: "isaiah",         chapter: 41,  verse: 10, ref: "Isaiah 41:10"          },
  { book: "isaiah",         chapter: 41,  verse: 13, ref: "Isaiah 41:13"          },
  { book: "isaiah",         chapter: 43,  verse: 1,  ref: "Isaiah 43:1"           },
  { book: "isaiah",         chapter: 43,  verse: 2,  ref: "Isaiah 43:2"           },
  { book: "isaiah",         chapter: 43,  verse: 18, ref: "Isaiah 43:18"          },
  { book: "isaiah",         chapter: 43,  verse: 19, ref: "Isaiah 43:19"          },
  { book: "isaiah",         chapter: 53,  verse: 3,  ref: "Isaiah 53:3"           },
  { book: "isaiah",         chapter: 53,  verse: 5,  ref: "Isaiah 53:5"           },
  { book: "isaiah",         chapter: 53,  verse: 6,  ref: "Isaiah 53:6"           },
  { book: "isaiah",         chapter: 54,  verse: 10, ref: "Isaiah 54:10"          },
  { book: "isaiah",         chapter: 55,  verse: 6,  ref: "Isaiah 55:6"           },
  { book: "isaiah",         chapter: 55,  verse: 8,  ref: "Isaiah 55:8"           },
  { book: "isaiah",         chapter: 55,  verse: 9,  ref: "Isaiah 55:9"           },
  { book: "isaiah",         chapter: 55,  verse: 11, ref: "Isaiah 55:11"          },
  { book: "isaiah",         chapter: 60,  verse: 1,  ref: "Isaiah 60:1"           },
  { book: "isaiah",         chapter: 61,  verse: 1,  ref: "Isaiah 61:1"           },
  { book: "isaiah",         chapter: 61,  verse: 3,  ref: "Isaiah 61:3"           },
  { book: "isaiah",         chapter: 64,  verse: 4,  ref: "Isaiah 64:4"           },
  { book: "isaiah",         chapter: 65,  verse: 24, ref: "Isaiah 65:24"          },
  // Jeremiah
  { book: "jeremiah",       chapter: 1,   verse: 5,  ref: "Jeremiah 1:5"          },
  { book: "jeremiah",       chapter: 17,  verse: 7,  ref: "Jeremiah 17:7"         },
  { book: "jeremiah",       chapter: 17,  verse: 8,  ref: "Jeremiah 17:8"         },
  { book: "jeremiah",       chapter: 29,  verse: 11, ref: "Jeremiah 29:11"        },
  { book: "jeremiah",       chapter: 29,  verse: 12, ref: "Jeremiah 29:12"        },
  { book: "jeremiah",       chapter: 29,  verse: 13, ref: "Jeremiah 29:13"        },
  { book: "jeremiah",       chapter: 31,  verse: 3,  ref: "Jeremiah 31:3"         },
  { book: "jeremiah",       chapter: 31,  verse: 33, ref: "Jeremiah 31:33"        },
  { book: "jeremiah",       chapter: 32,  verse: 17, ref: "Jeremiah 32:17"        },
  { book: "jeremiah",       chapter: 32,  verse: 27, ref: "Jeremiah 32:27"        },
  { book: "jeremiah",       chapter: 33,  verse: 3,  ref: "Jeremiah 33:3"         },
  // Lamentations
  { book: "lamentations",   chapter: 3,   verse: 22, ref: "Lamentations 3:22"     },
  { book: "lamentations",   chapter: 3,   verse: 23, ref: "Lamentations 3:23"     },
  { book: "lamentations",   chapter: 3,   verse: 24, ref: "Lamentations 3:24"     },
  // Ezekiel
  { book: "ezekiel",        chapter: 36,  verse: 26, ref: "Ezekiel 36:26"         },
  { book: "ezekiel",        chapter: 37,  verse: 5,  ref: "Ezekiel 37:5"          },
  // Daniel
  { book: "daniel",         chapter: 2,   verse: 20, ref: "Daniel 2:20"           },
  { book: "daniel",         chapter: 3,   verse: 17, ref: "Daniel 3:17"           },
  { book: "daniel",         chapter: 6,   verse: 10, ref: "Daniel 6:10"           },
  { book: "daniel",         chapter: 9,   verse: 18, ref: "Daniel 9:18"           },
  { book: "daniel",         chapter: 10,  verse: 19, ref: "Daniel 10:19"          },
  // Hosea
  { book: "hosea",          chapter: 6,   verse: 3,  ref: "Hosea 6:3"             },
  { book: "hosea",          chapter: 10,  verse: 12, ref: "Hosea 10:12"           },
  // Joel
  { book: "joel",           chapter: 2,   verse: 28, ref: "Joel 2:28"             },
  { book: "joel",           chapter: 2,   verse: 32, ref: "Joel 2:32"             },
  // Micah
  { book: "micah",          chapter: 6,   verse: 8,  ref: "Micah 6:8"             },
  { book: "micah",          chapter: 7,   verse: 7,  ref: "Micah 7:7"             },
  // Habakkuk
  { book: "habakkuk",       chapter: 2,   verse: 4,  ref: "Habakkuk 2:4"          },
  { book: "habakkuk",       chapter: 3,   verse: 17, ref: "Habakkuk 3:17"         },
  { book: "habakkuk",       chapter: 3,   verse: 18, ref: "Habakkuk 3:18"         },
  // Zephaniah
  { book: "zephaniah",      chapter: 3,   verse: 17, ref: "Zephaniah 3:17"        },
  // Malachi
  { book: "malachi",        chapter: 3,   verse: 10, ref: "Malachi 3:10"          },
  // Matthew
  { book: "matthew",        chapter: 4,   verse: 4,  ref: "Matthew 4:4"           },
  { book: "matthew",        chapter: 5,   verse: 3,  ref: "Matthew 5:3"           },
  { book: "matthew",        chapter: 5,   verse: 6,  ref: "Matthew 5:6"           },
  { book: "matthew",        chapter: 5,   verse: 8,  ref: "Matthew 5:8"           },
  { book: "matthew",        chapter: 5,   verse: 14, ref: "Matthew 5:14"          },
  { book: "matthew",        chapter: 5,   verse: 16, ref: "Matthew 5:16"          },
  { book: "matthew",        chapter: 6,   verse: 6,  ref: "Matthew 6:6"           },
  { book: "matthew",        chapter: 6,   verse: 20, ref: "Matthew 6:20"          },
  { book: "matthew",        chapter: 6,   verse: 25, ref: "Matthew 6:25"          },
  { book: "matthew",        chapter: 6,   verse: 26, ref: "Matthew 6:26"          },
  { book: "matthew",        chapter: 6,   verse: 33, ref: "Matthew 6:33"          },
  { book: "matthew",        chapter: 6,   verse: 34, ref: "Matthew 6:34"          },
  { book: "matthew",        chapter: 7,   verse: 7,  ref: "Matthew 7:7"           },
  { book: "matthew",        chapter: 7,   verse: 8,  ref: "Matthew 7:8"           },
  { book: "matthew",        chapter: 7,   verse: 24, ref: "Matthew 7:24"          },
  { book: "matthew",        chapter: 11,  verse: 28, ref: "Matthew 11:28"         },
  { book: "matthew",        chapter: 11,  verse: 29, ref: "Matthew 11:29"         },
  { book: "matthew",        chapter: 16,  verse: 24, ref: "Matthew 16:24"         },
  { book: "matthew",        chapter: 17,  verse: 20, ref: "Matthew 17:20"         },
  { book: "matthew",        chapter: 18,  verse: 20, ref: "Matthew 18:20"         },
  { book: "matthew",        chapter: 22,  verse: 37, ref: "Matthew 22:37"         },
  { book: "matthew",        chapter: 28,  verse: 19, ref: "Matthew 28:19"         },
  { book: "matthew",        chapter: 28,  verse: 20, ref: "Matthew 28:20"         },
  // Mark
  { book: "mark",           chapter: 1,   verse: 15, ref: "Mark 1:15"             },
  { book: "mark",           chapter: 9,   verse: 23, ref: "Mark 9:23"             },
  { book: "mark",           chapter: 10,  verse: 45, ref: "Mark 10:45"            },
  { book: "mark",           chapter: 11,  verse: 24, ref: "Mark 11:24"            },
  { book: "mark",           chapter: 12,  verse: 30, ref: "Mark 12:30"            },
  // Luke
  { book: "luke",           chapter: 1,   verse: 37, ref: "Luke 1:37"             },
  { book: "luke",           chapter: 1,   verse: 45, ref: "Luke 1:45"             },
  { book: "luke",           chapter: 2,   verse: 11, ref: "Luke 2:11"             },
  { book: "luke",           chapter: 4,   verse: 18, ref: "Luke 4:18"             },
  { book: "luke",           chapter: 6,   verse: 27, ref: "Luke 6:27"             },
  { book: "luke",           chapter: 6,   verse: 31, ref: "Luke 6:31"             },
  { book: "luke",           chapter: 9,   verse: 23, ref: "Luke 9:23"             },
  { book: "luke",           chapter: 10,  verse: 27, ref: "Luke 10:27"            },
  { book: "luke",           chapter: 11,  verse: 9,  ref: "Luke 11:9"             },
  { book: "luke",           chapter: 18,  verse: 1,  ref: "Luke 18:1"             },
  { book: "luke",           chapter: 18,  verse: 27, ref: "Luke 18:27"            },
  { book: "luke",           chapter: 19,  verse: 10, ref: "Luke 19:10"            },
  { book: "luke",           chapter: 21,  verse: 36, ref: "Luke 21:36"            },
  { book: "luke",           chapter: 24,  verse: 6,  ref: "Luke 24:6"             },
  // John
  { book: "john",           chapter: 1,   verse: 1,  ref: "John 1:1"              },
  { book: "john",           chapter: 1,   verse: 4,  ref: "John 1:4"              },
  { book: "john",           chapter: 1,   verse: 12, ref: "John 1:12"             },
  { book: "john",           chapter: 1,   verse: 14, ref: "John 1:14"             },
  { book: "john",           chapter: 3,   verse: 3,  ref: "John 3:3"              },
  { book: "john",           chapter: 3,   verse: 16, ref: "John 3:16"             },
  { book: "john",           chapter: 3,   verse: 17, ref: "John 3:17"             },
  { book: "john",           chapter: 4,   verse: 23, ref: "John 4:23"             },
  { book: "john",           chapter: 4,   verse: 24, ref: "John 4:24"             },
  { book: "john",           chapter: 5,   verse: 24, ref: "John 5:24"             },
  { book: "john",           chapter: 6,   verse: 35, ref: "John 6:35"             },
  { book: "john",           chapter: 7,   verse: 37, ref: "John 7:37"             },
  { book: "john",           chapter: 7,   verse: 38, ref: "John 7:38"             },
  { book: "john",           chapter: 8,   verse: 12, ref: "John 8:12"             },
  { book: "john",           chapter: 8,   verse: 31, ref: "John 8:31"             },
  { book: "john",           chapter: 8,   verse: 32, ref: "John 8:32"             },
  { book: "john",           chapter: 8,   verse: 36, ref: "John 8:36"             },
  { book: "john",           chapter: 10,  verse: 10, ref: "John 10:10"            },
  { book: "john",           chapter: 10,  verse: 11, ref: "John 10:11"            },
  { book: "john",           chapter: 10,  verse: 27, ref: "John 10:27"            },
  { book: "john",           chapter: 10,  verse: 28, ref: "John 10:28"            },
  { book: "john",           chapter: 11,  verse: 25, ref: "John 11:25"            },
  { book: "john",           chapter: 11,  verse: 35, ref: "John 11:35"            },
  { book: "john",           chapter: 13,  verse: 34, ref: "John 13:34"            },
  { book: "john",           chapter: 13,  verse: 35, ref: "John 13:35"            },
  { book: "john",           chapter: 14,  verse: 1,  ref: "John 14:1"             },
  { book: "john",           chapter: 14,  verse: 6,  ref: "John 14:6"             },
  { book: "john",           chapter: 14,  verse: 13, ref: "John 14:13"            },
  { book: "john",           chapter: 14,  verse: 15, ref: "John 14:15"            },
  { book: "john",           chapter: 14,  verse: 16, ref: "John 14:16"            },
  { book: "john",           chapter: 14,  verse: 17, ref: "John 14:17"            },
  { book: "john",           chapter: 14,  verse: 26, ref: "John 14:26"            },
  { book: "john",           chapter: 14,  verse: 27, ref: "John 14:27"            },
  { book: "john",           chapter: 15,  verse: 1,  ref: "John 15:1"             },
  { book: "john",           chapter: 15,  verse: 4,  ref: "John 15:4"             },
  { book: "john",           chapter: 15,  verse: 5,  ref: "John 15:5"             },
  { book: "john",           chapter: 15,  verse: 7,  ref: "John 15:7"             },
  { book: "john",           chapter: 15,  verse: 8,  ref: "John 15:8"             },
  { book: "john",           chapter: 15,  verse: 9,  ref: "John 15:9"             },
  { book: "john",           chapter: 15,  verse: 11, ref: "John 15:11"            },
  { book: "john",           chapter: 15,  verse: 13, ref: "John 15:13"            },
  { book: "john",           chapter: 15,  verse: 16, ref: "John 15:16"            },
  { book: "john",           chapter: 16,  verse: 13, ref: "John 16:13"            },
  { book: "john",           chapter: 16,  verse: 33, ref: "John 16:33"            },
  { book: "john",           chapter: 17,  verse: 3,  ref: "John 17:3"             },
  { book: "john",           chapter: 17,  verse: 17, ref: "John 17:17"            },
  { book: "john",           chapter: 20,  verse: 28, ref: "John 20:28"            },
  // Acts
  { book: "acts",           chapter: 1,   verse: 8,  ref: "Acts 1:8"              },
  { book: "acts",           chapter: 2,   verse: 17, ref: "Acts 2:17"             },
  { book: "acts",           chapter: 2,   verse: 38, ref: "Acts 2:38"             },
  { book: "acts",           chapter: 2,   verse: 42, ref: "Acts 2:42"             },
  { book: "acts",           chapter: 4,   verse: 12, ref: "Acts 4:12"             },
  { book: "acts",           chapter: 16,  verse: 31, ref: "Acts 16:31"            },
  { book: "acts",           chapter: 17,  verse: 28, ref: "Acts 17:28"            },
  // Romans
  { book: "romans",         chapter: 1,   verse: 16, ref: "Romans 1:16"           },
  { book: "romans",         chapter: 3,   verse: 23, ref: "Romans 3:23"           },
  { book: "romans",         chapter: 5,   verse: 1,  ref: "Romans 5:1"            },
  { book: "romans",         chapter: 5,   verse: 3,  ref: "Romans 5:3"            },
  { book: "romans",         chapter: 5,   verse: 4,  ref: "Romans 5:4"            },
  { book: "romans",         chapter: 5,   verse: 5,  ref: "Romans 5:5"            },
  { book: "romans",         chapter: 5,   verse: 8,  ref: "Romans 5:8"            },
  { book: "romans",         chapter: 6,   verse: 23, ref: "Romans 6:23"           },
  { book: "romans",         chapter: 8,   verse: 1,  ref: "Romans 8:1"            },
  { book: "romans",         chapter: 8,   verse: 11, ref: "Romans 8:11"           },
  { book: "romans",         chapter: 8,   verse: 14, ref: "Romans 8:14"           },
  { book: "romans",         chapter: 8,   verse: 15, ref: "Romans 8:15"           },
  { book: "romans",         chapter: 8,   verse: 26, ref: "Romans 8:26"           },
  { book: "romans",         chapter: 8,   verse: 28, ref: "Romans 8:28"           },
  { book: "romans",         chapter: 8,   verse: 31, ref: "Romans 8:31"           },
  { book: "romans",         chapter: 8,   verse: 37, ref: "Romans 8:37"           },
  { book: "romans",         chapter: 8,   verse: 38, ref: "Romans 8:38"           },
  { book: "romans",         chapter: 8,   verse: 39, ref: "Romans 8:39"           },
  { book: "romans",         chapter: 10,  verse: 9,  ref: "Romans 10:9"           },
  { book: "romans",         chapter: 10,  verse: 17, ref: "Romans 10:17"          },
  { book: "romans",         chapter: 12,  verse: 1,  ref: "Romans 12:1"           },
  { book: "romans",         chapter: 12,  verse: 2,  ref: "Romans 12:2"           },
  { book: "romans",         chapter: 12,  verse: 12, ref: "Romans 12:12"          },
  { book: "romans",         chapter: 15,  verse: 13, ref: "Romans 15:13"          },
  // 1 Corinthians
  { book: "1corinthians",   chapter: 1,   verse: 18, ref: "1 Corinthians 1:18"    },
  { book: "1corinthians",   chapter: 2,   verse: 9,  ref: "1 Corinthians 2:9"     },
  { book: "1corinthians",   chapter: 6,   verse: 19, ref: "1 Corinthians 6:19"    },
  { book: "1corinthians",   chapter: 10,  verse: 13, ref: "1 Corinthians 10:13"   },
  { book: "1corinthians",   chapter: 13,  verse: 4,  ref: "1 Corinthians 13:4"    },
  { book: "1corinthians",   chapter: 13,  verse: 13, ref: "1 Corinthians 13:13"   },
  { book: "1corinthians",   chapter: 15,  verse: 3,  ref: "1 Corinthians 15:3"    },
  { book: "1corinthians",   chapter: 15,  verse: 57, ref: "1 Corinthians 15:57"   },
  { book: "1corinthians",   chapter: 15,  verse: 58, ref: "1 Corinthians 15:58"   },
  // 2 Corinthians
  { book: "2corinthians",   chapter: 1,   verse: 3,  ref: "2 Corinthians 1:3"     },
  { book: "2corinthians",   chapter: 1,   verse: 4,  ref: "2 Corinthians 1:4"     },
  { book: "2corinthians",   chapter: 4,   verse: 7,  ref: "2 Corinthians 4:7"     },
  { book: "2corinthians",   chapter: 4,   verse: 17, ref: "2 Corinthians 4:17"    },
  { book: "2corinthians",   chapter: 4,   verse: 18, ref: "2 Corinthians 4:18"    },
  { book: "2corinthians",   chapter: 5,   verse: 7,  ref: "2 Corinthians 5:7"     },
  { book: "2corinthians",   chapter: 5,   verse: 17, ref: "2 Corinthians 5:17"    },
  { book: "2corinthians",   chapter: 5,   verse: 21, ref: "2 Corinthians 5:21"    },
  { book: "2corinthians",   chapter: 9,   verse: 8,  ref: "2 Corinthians 9:8"     },
  { book: "2corinthians",   chapter: 10,  verse: 5,  ref: "2 Corinthians 10:5"    },
  { book: "2corinthians",   chapter: 12,  verse: 9,  ref: "2 Corinthians 12:9"    },
  { book: "2corinthians",   chapter: 12,  verse: 10, ref: "2 Corinthians 12:10"   },
  // Galatians
  { book: "galatians",      chapter: 2,   verse: 20, ref: "Galatians 2:20"        },
  { book: "galatians",      chapter: 3,   verse: 26, ref: "Galatians 3:26"        },
  { book: "galatians",      chapter: 5,   verse: 1,  ref: "Galatians 5:1"         },
  { book: "galatians",      chapter: 5,   verse: 16, ref: "Galatians 5:16"        },
  { book: "galatians",      chapter: 5,   verse: 22, ref: "Galatians 5:22"        },
  { book: "galatians",      chapter: 5,   verse: 23, ref: "Galatians 5:23"        },
  { book: "galatians",      chapter: 6,   verse: 2,  ref: "Galatians 6:2"         },
  { book: "galatians",      chapter: 6,   verse: 9,  ref: "Galatians 6:9"         },
  // Ephesians
  { book: "ephesians",      chapter: 1,   verse: 3,  ref: "Ephesians 1:3"         },
  { book: "ephesians",      chapter: 1,   verse: 4,  ref: "Ephesians 1:4"         },
  { book: "ephesians",      chapter: 2,   verse: 4,  ref: "Ephesians 2:4"         },
  { book: "ephesians",      chapter: 2,   verse: 8,  ref: "Ephesians 2:8"         },
  { book: "ephesians",      chapter: 2,   verse: 10, ref: "Ephesians 2:10"        },
  { book: "ephesians",      chapter: 3,   verse: 17, ref: "Ephesians 3:17"        },
  { book: "ephesians",      chapter: 3,   verse: 20, ref: "Ephesians 3:20"        },
  { book: "ephesians",      chapter: 4,   verse: 32, ref: "Ephesians 4:32"        },
  { book: "ephesians",      chapter: 5,   verse: 2,  ref: "Ephesians 5:2"         },
  { book: "ephesians",      chapter: 6,   verse: 10, ref: "Ephesians 6:10"        },
  { book: "ephesians",      chapter: 6,   verse: 11, ref: "Ephesians 6:11"        },
  { book: "ephesians",      chapter: 6,   verse: 18, ref: "Ephesians 6:18"        },
  // Philippians
  { book: "philippians",    chapter: 1,   verse: 6,  ref: "Philippians 1:6"       },
  { book: "philippians",    chapter: 1,   verse: 21, ref: "Philippians 1:21"      },
  { book: "philippians",    chapter: 2,   verse: 3,  ref: "Philippians 2:3"       },
  { book: "philippians",    chapter: 2,   verse: 5,  ref: "Philippians 2:5"       },
  { book: "philippians",    chapter: 3,   verse: 10, ref: "Philippians 3:10"      },
  { book: "philippians",    chapter: 3,   verse: 14, ref: "Philippians 3:14"      },
  { book: "philippians",    chapter: 4,   verse: 4,  ref: "Philippians 4:4"       },
  { book: "philippians",    chapter: 4,   verse: 6,  ref: "Philippians 4:6"       },
  { book: "philippians",    chapter: 4,   verse: 7,  ref: "Philippians 4:7"       },
  { book: "philippians",    chapter: 4,   verse: 8,  ref: "Philippians 4:8"       },
  { book: "philippians",    chapter: 4,   verse: 11, ref: "Philippians 4:11"      },
  { book: "philippians",    chapter: 4,   verse: 13, ref: "Philippians 4:13"      },
  // Colossians
  { book: "colossians",     chapter: 1,   verse: 15, ref: "Colossians 1:15"       },
  { book: "colossians",     chapter: 1,   verse: 17, ref: "Colossians 1:17"       },
  { book: "colossians",     chapter: 2,   verse: 6,  ref: "Colossians 2:6"        },
  { book: "colossians",     chapter: 2,   verse: 7,  ref: "Colossians 2:7"        },
  { book: "colossians",     chapter: 3,   verse: 1,  ref: "Colossians 3:1"        },
  { book: "colossians",     chapter: 3,   verse: 2,  ref: "Colossians 3:2"        },
  { book: "colossians",     chapter: 3,   verse: 16, ref: "Colossians 3:16"       },
  { book: "colossians",     chapter: 3,   verse: 23, ref: "Colossians 3:23"       },
  // 1 Thessalonians
  { book: "1thessalonians", chapter: 5,   verse: 16, ref: "1 Thessalonians 5:16"  },
  { book: "1thessalonians", chapter: 5,   verse: 17, ref: "1 Thessalonians 5:17"  },
  { book: "1thessalonians", chapter: 5,   verse: 18, ref: "1 Thessalonians 5:18"  },
  // 2 Thessalonians
  { book: "2thessalonians", chapter: 3,   verse: 3,  ref: "2 Thessalonians 3:3"   },
  // 1 Timothy
  { book: "1timothy",       chapter: 2,   verse: 1,  ref: "1 Timothy 2:1"         },
  { book: "1timothy",       chapter: 6,   verse: 6,  ref: "1 Timothy 6:6"         },
  // 2 Timothy
  { book: "2timothy",       chapter: 1,   verse: 7,  ref: "2 Timothy 1:7"         },
  { book: "2timothy",       chapter: 2,   verse: 15, ref: "2 Timothy 2:15"        },
  { book: "2timothy",       chapter: 3,   verse: 16, ref: "2 Timothy 3:16"        },
  { book: "2timothy",       chapter: 3,   verse: 17, ref: "2 Timothy 3:17"        },
  { book: "2timothy",       chapter: 4,   verse: 7,  ref: "2 Timothy 4:7"         },
  // Titus
  { book: "titus",          chapter: 2,   verse: 11, ref: "Titus 2:11"            },
  { book: "titus",          chapter: 3,   verse: 5,  ref: "Titus 3:5"             },
  // Hebrews
  { book: "hebrews",        chapter: 1,   verse: 3,  ref: "Hebrews 1:3"           },
  { book: "hebrews",        chapter: 4,   verse: 12, ref: "Hebrews 4:12"          },
  { book: "hebrews",        chapter: 4,   verse: 15, ref: "Hebrews 4:15"          },
  { book: "hebrews",        chapter: 4,   verse: 16, ref: "Hebrews 4:16"          },
  { book: "hebrews",        chapter: 10,  verse: 23, ref: "Hebrews 10:23"         },
  { book: "hebrews",        chapter: 10,  verse: 24, ref: "Hebrews 10:24"         },
  { book: "hebrews",        chapter: 10,  verse: 25, ref: "Hebrews 10:25"         },
  { book: "hebrews",        chapter: 11,  verse: 1,  ref: "Hebrews 11:1"          },
  { book: "hebrews",        chapter: 11,  verse: 6,  ref: "Hebrews 11:6"          },
  { book: "hebrews",        chapter: 12,  verse: 1,  ref: "Hebrews 12:1"          },
  { book: "hebrews",        chapter: 12,  verse: 2,  ref: "Hebrews 12:2"          },
  { book: "hebrews",        chapter: 13,  verse: 5,  ref: "Hebrews 13:5"          },
  { book: "hebrews",        chapter: 13,  verse: 8,  ref: "Hebrews 13:8"          },
  // James
  { book: "james",          chapter: 1,   verse: 2,  ref: "James 1:2"             },
  { book: "james",          chapter: 1,   verse: 3,  ref: "James 1:3"             },
  { book: "james",          chapter: 1,   verse: 5,  ref: "James 1:5"             },
  { book: "james",          chapter: 1,   verse: 17, ref: "James 1:17"            },
  { book: "james",          chapter: 1,   verse: 22, ref: "James 1:22"            },
  { book: "james",          chapter: 4,   verse: 7,  ref: "James 4:7"             },
  { book: "james",          chapter: 4,   verse: 8,  ref: "James 4:8"             },
  { book: "james",          chapter: 5,   verse: 16, ref: "James 5:16"            },
  // 1 Peter
  { book: "1peter",         chapter: 1,   verse: 3,  ref: "1 Peter 1:3"           },
  { book: "1peter",         chapter: 1,   verse: 7,  ref: "1 Peter 1:7"           },
  { book: "1peter",         chapter: 2,   verse: 9,  ref: "1 Peter 2:9"           },
  { book: "1peter",         chapter: 2,   verse: 24, ref: "1 Peter 2:24"          },
  { book: "1peter",         chapter: 3,   verse: 15, ref: "1 Peter 3:15"          },
  { book: "1peter",         chapter: 5,   verse: 6,  ref: "1 Peter 5:6"           },
  { book: "1peter",         chapter: 5,   verse: 7,  ref: "1 Peter 5:7"           },
  { book: "1peter",         chapter: 5,   verse: 10, ref: "1 Peter 5:10"          },
  // 2 Peter
  { book: "2peter",         chapter: 1,   verse: 3,  ref: "2 Peter 1:3"           },
  { book: "2peter",         chapter: 1,   verse: 4,  ref: "2 Peter 1:4"           },
  { book: "2peter",         chapter: 3,   verse: 9,  ref: "2 Peter 3:9"           },
  { book: "2peter",         chapter: 3,   verse: 18, ref: "2 Peter 3:18"          },
  // 1 John
  { book: "1john",          chapter: 1,   verse: 7,  ref: "1 John 1:7"            },
  { book: "1john",          chapter: 1,   verse: 9,  ref: "1 John 1:9"            },
  { book: "1john",          chapter: 2,   verse: 1,  ref: "1 John 2:1"            },
  { book: "1john",          chapter: 3,   verse: 1,  ref: "1 John 3:1"            },
  { book: "1john",          chapter: 3,   verse: 16, ref: "1 John 3:16"           },
  { book: "1john",          chapter: 4,   verse: 4,  ref: "1 John 4:4"            },
  { book: "1john",          chapter: 4,   verse: 7,  ref: "1 John 4:7"            },
  { book: "1john",          chapter: 4,   verse: 8,  ref: "1 John 4:8"            },
  { book: "1john",          chapter: 4,   verse: 10, ref: "1 John 4:10"           },
  { book: "1john",          chapter: 4,   verse: 18, ref: "1 John 4:18"           },
  { book: "1john",          chapter: 4,   verse: 19, ref: "1 John 4:19"           },
  { book: "1john",          chapter: 5,   verse: 4,  ref: "1 John 5:4"            },
  { book: "1john",          chapter: 5,   verse: 11, ref: "1 John 5:11"           },
  { book: "1john",          chapter: 5,   verse: 14, ref: "1 John 5:14"           },
  // Jude
  { book: "jude",           chapter: 1,   verse: 24, ref: "Jude 1:24"             },
  // Revelation
  { book: "revelation",     chapter: 1,   verse: 8,  ref: "Revelation 1:8"        },
  { book: "revelation",     chapter: 2,   verse: 10, ref: "Revelation 2:10"       },
  { book: "revelation",     chapter: 3,   verse: 8,  ref: "Revelation 3:8"        },
  { book: "revelation",     chapter: 3,   verse: 20, ref: "Revelation 3:20"       },
  { book: "revelation",     chapter: 4,   verse: 8,  ref: "Revelation 4:8"        },
  { book: "revelation",     chapter: 5,   verse: 12, ref: "Revelation 5:12"       },
  { book: "revelation",     chapter: 7,   verse: 9,  ref: "Revelation 7:9"        },
  { book: "revelation",     chapter: 19,  verse: 6,  ref: "Revelation 19:6"       },
  { book: "revelation",     chapter: 21,  verse: 3,  ref: "Revelation 21:3"       },
  { book: "revelation",     chapter: 21,  verse: 4,  ref: "Revelation 21:4"       },
  { book: "revelation",     chapter: 21,  verse: 5,  ref: "Revelation 21:5"       },
  { book: "revelation",     chapter: 22,  verse: 4,  ref: "Revelation 22:4"       },
  { book: "revelation",     chapter: 22,  verse: 20, ref: "Revelation 22:20"      },
];

// Returns 0 on Jan 1, 364 on Dec 31
function getDayOfYear() {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000);
}

function getGreeting() {
  const hour = new Date().getHours();
  const name = localStorage.getItem("abide_name") || "";
  const g = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${g}, ${name}` : g;
}

/* ── Card art panels — gradient backgrounds with white icons ── */

const panelBase = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

function ArtDialogue() {
  return (
    <div style={{ ...panelBase, background: "linear-gradient(150deg, rgba(var(--accent-rgb),0.55) 0%, rgba(var(--accent-rgb),0.18) 100%)" }}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="9" y1="14" x2="13" y2="14" />
      </svg>
    </div>
  );
}

function ArtDevotionals() {
  return (
    <div style={{ ...panelBase, background: "linear-gradient(135deg, rgba(var(--accent-rgb),0.65) 0%, rgba(var(--accent-rgb),0.22) 100%)" }}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
      </svg>
    </div>
  );
}

function ArtDailyAbiding() {
  return (
    <div style={{ ...panelBase, background: "linear-gradient(160deg, rgba(var(--accent-rgb),0.70) 0%, rgba(var(--accent-rgb),0.20) 100%)" }}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="rgba(255,255,255,0.85)" stroke="none" />
      </svg>
    </div>
  );
}

function ArtDictionary() {
  return (
    <div style={{ ...panelBase, background: "linear-gradient(120deg, rgba(var(--accent-rgb),0.60) 0%, rgba(var(--accent-rgb),0.18) 100%)" }}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z" />
        <path d="M17 4h3v16h-3" />
        <line x1="9" y1="9" x2="13" y2="9" />
        <line x1="9" y1="13" x2="13" y2="13" />
      </svg>
    </div>
  );
}

function ArtChristRevealed() {
  return (
    <div style={{ ...panelBase, background: "linear-gradient(145deg, rgba(var(--accent-rgb),0.80) 0%, rgba(var(--accent-rgb),0.30) 100%)" }}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
        <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
        <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
        <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
      </svg>
    </div>
  );
}

const FEED_ITEMS = [
  { id: "dialogue",         label: "Dialoguing with God", title: "Reflect, pray, and listen",       sub: "Write spontaneous notes, reflections & prayers", art: <ArtDialogue /> },
  { id: "devotionals",      label: "Devotionals",          title: "Daily inspiration & study",       sub: "Guided devotional reading",                      art: <ArtDevotionals /> },
  { id: "daily-abiding",    label: "Daily Abiding",        title: "Video devotional experiences",    sub: "Watch and meditate on the Word",                 art: <ArtDailyAbiding /> },
  { id: "abide-dictionary", label: "Abide Dictionary",     title: "Your word study collection",      sub: "Curated words from your time in Scripture",      art: <ArtDictionary /> },
  { id: "christ-revealed",  label: "Christ Revealed",      title: "Jesus from Genesis to Revelation",sub: "See Christ woven through all of Scripture",      art: <ArtChristRevealed />, featured: true },
];

function VerseHeroCard({ verseText, verseLoading, todayVerse, translation, onReadChapter }) {
  return (
    <div style={{
      borderRadius: 18,
      overflow: "hidden",
      background: "rgba(var(--accent-rgb),0.13)",
      border: "1px solid rgba(var(--accent-rgb),0.18)",
      marginBottom: 28,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, rgba(var(--accent-rgb),0.07) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div style={{ padding: "22px 22px 20px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-accent)", fontFamily: "var(--font-ui, system-ui)", opacity: 0.7 }}>
            Verse of the Day
          </div>
          <div style={{ flex: 1, height: 1, background: "rgba(var(--accent-rgb),0.18)" }} />
        </div>

        {verseLoading ? (
          <div style={{ height: 80, display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 13, opacity: 0.3, color: "var(--text-primary)", fontFamily: "var(--font-ui, system-ui)" }}>…</div>
          </div>
        ) : (
          <p style={{ fontFamily: "var(--font-body, Georgia, serif)", fontSize: 21, fontWeight: 400, lineHeight: 1.65, fontStyle: "italic", color: "var(--text-primary)", margin: "0 0 18px", opacity: 0.92 }}>
            {verseText || todayVerse.ref}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(var(--accent-rgb),0.14)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 13, fontWeight: 700, color: "var(--text-accent)", letterSpacing: "0.01em" }}>
              {todayVerse.ref}
            </div>
            <div style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 11, color: "var(--text-primary)", opacity: 0.35, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {translation}
            </div>
          </div>
          <button
            onClick={onReadChapter}
            style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 12, fontWeight: 700, color: "var(--text-accent)", background: "rgba(var(--accent-rgb),0.12)", border: "1px solid rgba(var(--accent-rgb),0.22)", borderRadius: 20, padding: "4px 12px", cursor: "pointer", WebkitTapHighlightColor: "transparent", letterSpacing: "0.02em" }}
          >
            Read chapter
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedCard({ item, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate(item.id)}
      style={{ width: "100%", textAlign: "left", background: "rgba(var(--accent-rgb),0.04)", border: "1px solid rgba(var(--accent-rgb),0.09)", borderRadius: 16, padding: 0, cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation", display: "flex", alignItems: "stretch", overflow: "hidden", minHeight: 88 }}
    >
      <div style={{ flex: 1, padding: "16px 0 16px 18px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-accent)", opacity: item.featured ? 0.85 : 0.5, marginBottom: 2 }}>
          {item.label}
        </div>
        <div style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1.25 }}>
          {item.title}
        </div>
        <div style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 12, color: "var(--text-primary)", opacity: 0.35, lineHeight: 1.35, marginTop: 2 }}>
          {item.sub}
        </div>
      </div>
      <div style={{ width: 80, flexShrink: 0, alignSelf: "stretch", overflow: "hidden" }}>
        {item.art}
      </div>
    </button>
  );
}

export default function HomeScreen({ theme, translation, onNavigate }) {
  const todayVerse = DAILY_VERSES[getDayOfYear() % DAILY_VERSES.length];
  const [verseText, setVerseText] = useState(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    setVerseLoading(true);
    setVerseText(null);
    const base = import.meta.env.BASE_URL;
    const trans = translation.toLowerCase();
    fetch(`${base}data/translations/${trans}/${todayVerse.book}/${todayVerse.chapter}.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        let versesObj = data.verses;
        if (!versesObj && Array.isArray(data.sections)) {
          versesObj = data.sections.reduce((acc, s) => ({ ...acc, ...s.verses }), {});
        }
        if (!versesObj) return;
        const raw = versesObj[String(todayVerse.verse)];
        if (!raw) return;
        const verseStr = typeof raw === "string" ? raw : (raw?.text ?? null);
        if (verseStr) setVerseText(verseStr);
      })
      .catch(() => {})
      .finally(() => setVerseLoading(false));
  }, [translation]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ height: "100dvh", overflowY: "auto", background: "var(--bg-app)", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: "0 20px 120px" }}>

        <div style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 48px)", marginBottom: 28 }}>
          <p style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 12, color: "var(--text-primary)", opacity: 0.35, margin: "0 0 6px", letterSpacing: "0.02em" }}>
            {today}
          </p>
          <h1 style={{ fontFamily: "var(--font-ui, system-ui)", fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", lineHeight: 1.2, margin: 0 }}>
            {getGreeting()}
          </h1>
        </div>

        <VerseHeroCard
          verseText={verseText}
          verseLoading={verseLoading}
          todayVerse={todayVerse}
          translation={translation}
          onReadChapter={() => onNavigate("scripture", { book: todayVerse.book, chapter: todayVerse.chapter })}
        />

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-accent)", opacity: 0.45, fontFamily: "var(--font-ui, system-ui)", marginBottom: 14 }}>
          Your Practice
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEED_ITEMS.map((item) => (
            <FeedCard key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </div>

      </div>
    </div>
  );
}
