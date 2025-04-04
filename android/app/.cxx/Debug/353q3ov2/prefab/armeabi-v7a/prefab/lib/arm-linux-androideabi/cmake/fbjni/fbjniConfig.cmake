if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "C:/Users/Gusta/.gradle/caches/8.10.2/transforms/a14fb93a6ff815d3dc43a1cc38e5a120/transformed/fbjni-0.6.0/prefab/modules/fbjni/libs/android.armeabi-v7a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Gusta/.gradle/caches/8.10.2/transforms/a14fb93a6ff815d3dc43a1cc38e5a120/transformed/fbjni-0.6.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

